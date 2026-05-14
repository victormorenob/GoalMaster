// backend/src/middlewares/transactionMiddleware.js
const db = require("../config/database");

/**
 * AUTOMATIC TRANSACTION middleware FOR TESTING ENVIRONMENT ONLY.
 *
 * Purpose:
 * This middleware wraps each test request in a Sequelize transaction.
 * On request completion, it COMMITS if the response was successful (status < 400)
 * or ROLLS BACK if there was an error. This ensures the database stays clean
 * between integration test cases, as each test's changes are undone.
 *
 * IMPORTANT: Do not activate this middleware in development or production environments,
 * as explicit transaction management in services is safer and more robust.
 */
const transactionMiddleware = async (req, res, next) => {
    // Only runs in the 'test' environment.
    if (process.env.NODE_ENV !== "test") {
        return next();
    }

    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        req.transaction = transaction; // Attach the transaction to the request object

        // Listen for the 'finish' event, which fires when the response has been sent.
        res.on('finish', async () => {
            // Ensure the transaction has not been finalized already.
            if (transaction && !transaction.finished) {
                try {
                    // If the status code indicates success, commit the transaction.
                    if (res.statusCode < 400) {
                        await transaction.commit();
                    } else {
                        // If there was an error, roll back the transaction.
                        await transaction.rollback();
                    }
                } catch (transactionError) {
                    console.error("[Transaction Middleware] Error finalizing transaction:", transactionError);
                    // Final rollback attempt if commit fails.
                    if (!transaction.finished) {
                        await transaction.rollback();
                    }
                }
            }
        });

        next();

    } catch (error) {
        console.error("[Transaction Middleware] Error starting transaction:", error);
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        next(error); // Pass the error to the global handler.
    }
};

module.exports = transactionMiddleware;