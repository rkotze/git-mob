import https from 'node:https';

export type BasicResponse = {
  statusCode: number | undefined;
  data: Record<string, unknown>;
};

async function httpFetch(
  url: string,
  options: https.RequestOptions
): Promise<BasicResponse> {
  return new Promise((resolve, reject) => {
    const httpRequest = https
      .request(url, options, response => {
        let chunkedData = '';

        response.on('data', (chunk: string) => {
          chunkedData += chunk;
        });

        response.on('end', () => {
          resolve({
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

export { httpFetch };
