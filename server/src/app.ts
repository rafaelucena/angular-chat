import * as BodyParser from 'body-parser';
import * as Express from 'express';
import * as Session from 'express-session';
import * as Helmet from 'helmet';
import * as Http from 'http';
import * as Knex from 'knex';
import * as Morgan from 'morgan';

import { default as Chalk } from 'chalk';
import { Application, CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express';
import { Server as HttpServer } from 'http';

import { API_ROOT_PATH, HOST, NODE_ENV, PORT, SESSION_MAXAGE, SESSION_NAME, SESSION_SECRET } from './config';
import { Api, WebSockets } from './routes';
import { Database, Logger } from './shared';
import { Timestamp } from './utils';

export class App {
  private static logger = Logger.getInstance();

  public static async run() {
    const db: Knex = await Database.getInstance();

    // Express server initialization.
    const app: Application = Express();

    const session = this.initializeSession(app, db);
    this.setupMiddlewares(app);
    this.setupRoutes(app);

    // WebSockets server initialization.
    const httpServer: HttpServer = Http.createServer(app);
    WebSockets.setupWebSocketsServer(httpServer, session);

    // Start the app.
    httpServer.listen(PORT, HOST, () => {
      this.logger.notice(
        Chalk`{underline {red ${'Angular Chat'}}} is running in {green ${NODE_ENV}} mode on address {green ${HOST}} and port {green ${PORT.toString()}}.`,
      );
    });
  }

  private static initializeSession(app: Application, db: Knex): RequestHandler {
    const KnexSessionStore = require('connect-session-knex')(Session);

    const store = new KnexSessionStore({
      knex: db,
    });

    const session: RequestHandler = Session({
      cookie: {
        domain: HOST,
        maxAge: SESSION_MAXAGE,
      } as CookieOptions,
      name: SESSION_NAME,
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
      store,
      unset: 'destroy',

    });

    app.use(session);

    return session;
  }

  private static setupMiddlewares(app: Application): void {
    // Additional security headers (https://helmetjs.github.io/).
    app.use(Helmet());

    // CORS.
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Origin', req.headers.origin as string);
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
      );
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, UPGRADE, HEAD');
      next();
    });

    // HTTP Logger.
    Morgan.token('timestamp', () => Timestamp.getFormattedTimestamp());
    app.use(Morgan(`:timestamp API: :method - :status - :url - :res[content-length] - :response-time ms`));

    // Body parser.
    app.use(BodyParser.json());
    app.use(
      BodyParser.urlencoded({
        extended: false,
      }),
    );
  }

  private static setupRoutes(app: Application): void {
    // Application routes.
    app.use(API_ROOT_PATH, Api.initialize());
  }
}
