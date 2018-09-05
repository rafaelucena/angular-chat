export const Logger: any = jest.genMockFromModule('../logger');

Logger.getInstance = () => {
  /* tslint:disable-next-line */
  return { debug: () => {} };
};

export default Logger;
