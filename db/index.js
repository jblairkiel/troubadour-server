let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config.env') })
const { Pool } = require('pg');
process.env.CONNECTION_STRING
const pool = new Pool()
// const pool = new Pool({
//     user: 'postgres',
//     host: '127.0.0.1',
//     database: 'troubadour',
//     password: '1',
//     port: 5432,
//   })
pool.connect();

module.exports = {
    async query(text, params) {
        // invocation timestamp for the query method
        
        const start = Date.now();
        try {
            await pool.query(text, params).then(function(res){

                // time elapsed since invocation to execution
                const duration = Date.now() - start;
                console.log(
                'executed query', 
                {text, duration, rows: res.rowCount}
                );
                return res;
            }).catch(function(err){
                console.log(err);
                return err;
            });
        } catch (error) {
            console.log('error in query', {text});
            throw error;
        }
    }
};