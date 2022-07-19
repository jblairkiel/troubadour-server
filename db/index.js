let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config.env') })
const { Pool } = require('pg');
const pool = new Pool()
pool.connect();

module.exports = {
    async insertQuery(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const result = await pool.query(text, params)
            const duration = Date.now() - start;
            console.log(
            'executed query', 
            {text, duration, rows: result.rowCount}
            );
            return result.rowCount
            // await pool.query(text, params).then(function(res){

            //     // time elapsed since invocation to execution
            //     const duration = Date.now() - start;
            //     console.log(
            //     'executed query', 
            //     {text, duration, rows: res.rowCount}
            //     );
            //     return res;
            // }).catch(function(err){
            //     console.log(err);
            //     return err;
            // });
        } catch (error) {
            console.log('error in query', {text});
            throw error;
        }
    },
    async updateQuery(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const result = await pool.query(text, params)
            const duration = Date.now() - start;
            console.log(
            'executed query', 
            {text, duration, rows: result.rowCount}
            );
            return result.rowCount
            // await pool.query(text, params).then(function(res){

            //     // time elapsed since invocation to execution
            //     const duration = Date.now() - start;
            //     console.log(
            //     'executed query', 
            //     {text, duration, rows: res.rowCount}
            //     );
            //     return res;
            // }).catch(function(err){
            //     console.log(err);
            //     return err;
            // });
        } catch (error) {
            console.log('error in query', {text});
            throw error;
        }
    },

    async queryGetOne(text, params) {
        // invocation timestamp for the query method
        const start = Date.now();
        try {
            const queryResult = await pool.query(text, params)
            return queryResult.rows[0];
            // await pool.query(text, params).then(function(res){

            //     // time elapsed since invocation to execution
            //     const duration = Date.now() - start;
            //     console.log(
            //     'executed query', 
            //     {text, duration, rows: res.rowCount}
            //     );
            //     return res.rows[0];
            // }).catch(function(err){
            //     console.log(err);
            //     return err;
            // });
        } catch (error) {
            console.log('error in query', {text});
            throw error;
        }
    }
};