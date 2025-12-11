const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const contactRouter = require('./routes/contactRoutes');
const profilePhotoRouter = require('./routes/profilePhotoRoutes');
const eventRouter = require('./routes/eventRoutes');
const locationRouter = require('./routes/locationRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/collaboraid/api/users', userRouter);
app.use('/collaboraid/api/contact', contactRouter)
app.use('/collaboraid/api/profile-photo', profilePhotoRouter);
app.use('/collaboraid/api/events', eventRouter);
app.use('/collaboraid/api/location', locationRouter);


app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;