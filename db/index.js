let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config.env') })
//const { Pool } = require('pg');
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'troubadour',
    user: 'postgres',
    password: '1',
    max: 30 // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};
const pgp = require('pg-promise')();

const pool = pgp(cn);
//const pool = new Pool()
pool.connect();

module.exports = {
    async insertMultiple(columnNames, tableName, bulkDataset) {
        try {

            const setTable = new pgp.helpers.ColumnSet(columnNames, { table: tableName });
            const onConflict = ' ON CONFLICT ON CONSTRAINT pref_unique DO NOTHING RETURNING *';
            const insertOnConflict = pgp.helpers.insert(bulkDataset, setTable) + onConflict;
            // executing the query:
            await pool.none(insertOnConflict);
            return bulkDataset;
        } catch (err) {
            console.log("error", { err });
        }
    },
    async insertQuery(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const result = await pool.query(text, params)
            const duration = Date.now() - start;
            console.log(
                'executed query',
                { text, duration, rows: result.rowCount }
            );
            return result.rowCount
        } catch (error) {
            console.log('error in query', { text });
            throw error;
        }
    },
    async updateQuery(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const result = await pool.any(text, params)
            const duration = Date.now() - start;
            console.log(
                'executed query',
                { text, duration, rows: result.rowCount }
            );
            return result.rowCount
        } catch (error) {
            console.log('error in query', { text });
            throw error;
        }
    },

    async queryGetOne(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const queryResult = await pool.any(text, params)
            const duration = Date.now() - start;
            console.log(
                'executed query',
                { text, duration, rows: queryResult.rowCount }
            );
            return queryResult[0];
        } catch (error) {
            console.log('error in query', { text });
            throw error;
        }
    },

    async query(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const queryResult = await pool.any(text, params)
            const duration = Date.now() - start;
            console.log(
                'executed query',
                { text, duration, rows: queryResult.rowCount }
            );
            return queryResult.rows;
        } catch (error) {
            console.log('error in query', { text });
            throw error;
        }
    }
};