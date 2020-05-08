CREATE TABLE IF NOT EXISTS `users` (
    `user_ID` int NOT NULL AUTO_INCREMENT,
    `login` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `logined` boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`user_ID`)
); 