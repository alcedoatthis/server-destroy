module.exports = enableDestroy;

function enableDestroy(server) {
  var connections = {}

  server.on('connection', function(conn) {
    var key = conn.remoteAddress + ':' + conn.remotePort;
    connections[key] = conn;
    conn.on('close', function() {
      delete connections[key];
    });
  });

  server.destroy = function(cb) {
    var maybePromise;

    if(!cb) {
      maybePromise = new Promise(function(resolve, reject) {
        server.close(function(err) {
          err instanceof Error ? reject(err) : resolve();
        });
      })
    } else {
      server.close(cb);
    }
    for (var key in connections)
      connections[key].destroy();
    
    return maybePromise;
  };
  return server;
}
