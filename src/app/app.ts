import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import morgan from 'morgan';
import cron from 'node-cron';
import PublicCommonService from '../features/public/services/publicCommon.service';
import ErrorHandler from '../middleware/errorHandler/errorHandler';
import CustomError from '../utils/lib/customError';
import { cors_origin_name } from '../utils/miscellaneous/constants';
import { setUpCorsOrigin } from './database';
import { client } from './redis';
import RootRouter from './router';
import { SocketServer, io } from './socket';
import { origin } from '../utils/miscellaneous/cors';

class App {
  public app: Application = express();
  private server: Server;
  private port: number;
  private origin: string[];

  constructor(port: number) {
    this.server = SocketServer(this.app);
    this.port = port;
    this.initMiddleware();
    this.initRouters();
    this.socket();
    this.runCron();
    this.notFoundRouter();
    this.errorHandle();
    this.disableXPoweredBy();
    this.origin = origin;
  }

  // Run cron jobs
  private async runCron() {
    // Run every 3 days at 12:00 AM
    cron.schedule('0 0 */5 * *', async () => {
      // await services.getSabreToken();
    });
  }

  //start server
  public async startServer() {
    setUpCorsOrigin();
    const services = new PublicCommonService();
    await services.getSabreToken();
    this.server.listen(this.port, () => {
      console.log(
        `Booking Expert V2 OTA server has started successfully at port: ${this.port}...🚀`
      );
    });
  }

  //init middleware
  private async initMiddleware() {
    const cors_origin = JSON.parse(
      (await client.get(cors_origin_name)) as string
    );

    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ limit: '2mb', extended: true }));
    this.app.use(morgan('dev'));
    this.app.use(cors({ origin: this.origin, credentials: true }));
  }

  // socket connection
  private socket() {
    io.use((socket, next) => {
      if (!socket.handshake.auth?.id) {
        next(new Error('Provide id into auth.'));
      } else {
        next();
      }
    });

    io.on('connection', async (socket) => {
      const { id, type } = socket.handshake.auth;
      console.log(socket.id, '-', id, '-', type, ' is connected ⚡');

      socket.on('disconnect', async (event) => {
        console.log(socket.id, '-', id, '-', type, ' disconnected...');
        socket.disconnect();
      });
    });
  }

  // init routers
  private initRouters() {
    this.app.get('/', (_req: Request, res: Response) => {
      res.send(`Booking Expert OTA server is running successfully...🚀`);
    });

    this.app.get('/api', (_req: Request, res: Response) => {
      res.send(`Booking Expert OTA API is active...🚀`);
    });

    this.app.use('/api/v2', new RootRouter().v2Router);
  }

  // not found router
  private notFoundRouter() {
    this.app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
      next(new CustomError('Cannot found the route', 404));
    });
  }

  // error handler
  private errorHandle() {
    this.app.use(new ErrorHandler().handleErrors);
  }

  //disable x-powered-by
  private disableXPoweredBy() {
    this.app.disable('x-powered-by');
  }
}

export default App;
