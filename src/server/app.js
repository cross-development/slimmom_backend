//Core
const express = require('express');
const mongoose = require('mongoose');
//Middleware
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
//Router
const authRouter = require('../api/auth/auth.router');
const userRouter = require('../api/users/user.router');
//Handle logs
const accessLogStream = require('../utils/accessLogStream');

class Server {
	constructor() {
		this.server = null;
	}

	async start() {
		this.initServer();
		this.initMiddleware();
		this.initRouter();
		await this.initDatabase();
		this.startListening();
	}

	initServer() {
		this.server = express();
	}

	initMiddleware() {
		this.server.use(express.json());
		this.server.use(morgan('combined', { stream: accessLogStream }));
		this.server.use(cors({ origin: `${process.env.CORS_URL}` }));
	}

	initRouter() {
		this.server.use('/api/auth', authRouter);
		this.server.use('/api/users', userRouter);
	}

	async initDatabase() {
		try {
			await mongoose.connect(process.env.MONGODB_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
			});

			console.log('Database connection successful');
		} catch (error) {
			process.exit(1);
		}
	}

	startListening() {
		this.server.listen(process.env.PORT, () => {
			console.log('Server started listening on port', process.env.PORT);
		});
	}
}

module.exports = Server;
