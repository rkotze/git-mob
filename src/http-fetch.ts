import https from 'node:https';

type BasicResponse = {
  statusCode: number | undefined;
  data: JSON;
};

async function fetch(
  url: string,
  options: https.RequestOptions
): Promise<BasicResponse> {
  const mergedOptions = {
    ...options,
    header: appendAgentHeader(options.headers),
  };
  return new Promise((fulfil, reject) => {
    const httpRequest = https
      .request(url, mergedOptions, response => {
        let chunkedData = '';

        response.on('data', (chunk: string) => {
          chunkedData += chunk;
        });

        response.on('end', () => {
          fulfil({
            statusCode: response.statusCode,
            data: JSON.parse(chunkedData) as JSON,
          });
        });
      })
      .on('error', error => {
        reject(error);
      });

    httpRequest.end();
  });
}

function appendAgentHeader(headers: https.RequestOptions['headers']) {
  const userAgentHeader = { 'User-Agent': 'git-mob-cli' };
  if (headers) {
    return {
      ...headers,
      ...userAgentHeader,
    };
  }

  return userAgentHeader;
}

export { fetch };
