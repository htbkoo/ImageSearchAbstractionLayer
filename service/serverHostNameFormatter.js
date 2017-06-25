module.exports = {
    appendProtocolToHostName: function (hostname, protocol) {
        protocol = protocol || "https";
        return protocol.toString().concat("://").concat(hostname);
    }
};
