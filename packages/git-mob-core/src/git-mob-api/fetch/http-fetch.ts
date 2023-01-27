import https from 'node:https';

export type BasicResponse = {
  statusCode: number | undefined;
  data: Record<string, unknown>;
};

async function httpFetch(
  url: string,
  options: https.RequestOptions
): Promise<BasicResponse> {
  const mergedOptions = {
    ...options,
    headers: appendAgentHeader(options.headers),
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: JSON.parse(chunkedData),
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

export { httpFetch };
