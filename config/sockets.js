/**
 * WebSocket Server Settings
 * (sails.config.sockets)
 *
 * Use the settings below to configure realtime functionality in your app.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For all available options, see:
 * https://sailsjs.com/config/sockets
 */

module.exports.sockets = {

  /***************************************************************************
  *                                                                          *
  * `transports`                                                             *
  *                                                                          *
  * The protocols or "transports" that socket clients are permitted to       *
  * use when connecting and communicating with this Sails application.       *
  *                                                                          *
  * > Never change this here without also configuring `io.sails.transports`  *
  * > in your client-side code.  If the client and the server are not using  *
  * > the same array of transports, sockets will not work properly.          *
  * >                                                                        *
  * > For more info, see:                                                    *
  * > https://sailsjs.com/docs/reference/web-sockets/socket-client           *
  *                                                                          *
  ***************************************************************************/

  transports: [ 'websocket' ],


  /***************************************************************************
  *                                                                          *
  * `beforeConnect`                                                          *
  *                                                                          *
  * This custom beforeConnect function will be run each time BEFORE a new    *
  * socket is allowed to connect, when the initial socket.io handshake is    *
  * performed with the server.                                               *
  *                                                                          *
  * https://sailsjs.com/config/sockets#?beforeconnect                        *
  *                                                                          *
  ***************************************************************************/

  beforeConnect: async function(handshake, proceed) {
    let token = handshake.headers.token

    if (!token) {
      return proceed(undefined, false);
    }

    try {
      var decoded = jwt.verify(token, process.env.APP_KEY)
    } catch(err) {
      return proceed(undefined, false);
    }

    if (!decoded.id) {
      return proceed(undefined, false);
    }

    var user = await User.findOne(decoded.id)
    if (!user) {
      return proceed(undefined, false);
    }
    
    console.log('User connected')
    return proceed(undefined, true);
  },

  // onlyAllowOrigins: ['http://localhost', 'http://10.1.10.224', 'http://127.0.0.1']


  /***************************************************************************
  *                                                                          *
  * `afterDisconnect`                                                        *
  *                                                                          *
  * This custom afterDisconnect function will be run each time a socket      *
  * disconnects                                                              *
  *                                                                          *
  ***************************************************************************/

  afterDisconnect: async function(session, socket, done) {
  
    console.log("User disconnected")

    // console.log("SESSION", session)
    // console.log("SOCKET", socket)

    await User.updateOne({ socket_id: socket.id }).set({ socket_id: null })

    // By default: do nothing.
    // (but always trigger the callback)
    return done();
  
  },


  /***************************************************************************
  *                                                                          *
  * Whether to expose a 'GET /__getcookie' route that sets an HTTP-only      *
  * session cookie.                                                          *
  *                                                                          *
  ***************************************************************************/

  // grant3rdPartyCookie: true,


};
