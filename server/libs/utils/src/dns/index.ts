const dns = require('dns');

export function checkDomainExists(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve(domain, 'A', (err, addresses) => {
      if (err) {
        if (err.code === 'ENOTFOUND') {
          // Domain does not exist
          resolve(false);
        } else {
          // Other errors
          reject(err);
        }
      } else {
        // Domain exists if A records are found
        resolve(true);
      }
    });
  });
}
