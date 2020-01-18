module.exports = async function (req, res) {

    if (!req.isSocket) {
        return res.badRequest();
    }

    await User.updateOne({ id: req.user.id }).set({ socket_id: sails.sockets.getId(req) })
    return res.ok()

};
