var sql = require('mssql');

var config = {
    user: 'sa',
    password: '1111',
    server: '127.0.0.1',
    database: 'mydb',
    requestTimeout: 30000,
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

var MAXCOUNT = 10;				// 한번에 조회할 row 갯수
var REPEAT_COUNT = 20; 			// 반복할 횟수
var EXPANSION = 1000000;		// 한번에 증가할 offset 증가값
var currCount = 0;				// 전역변수

function exec_GetAuthLog(connection, offset)
{
	var request = new sql.Request(connection);
	request.input('StartDateTime', sql.DateTime, new Date("2016/05/01 00:00:00"));
	request.input('EndDateTime', sql.DateTime, new Date("2016/08/31 23:59:59"));
	request.input('SearchResult', sql.Int, 0);
	request.input('SearchCategory', sql.Int, 0);
	request.input('SearchKeyword', sql.NVarChar(50), "박원기");
	request.input('privilegeID', sql.Int, 1);
	request.input('maxCount', sql.Int, MAXCOUNT);
	request.input('offset', sql.BigInt, offset);

	var start = Date.now()
	request.execute('ngsp_GetAuthLogList', function (err, recordsets, returnValue) {
	    if(err && err.code == 'ETIMEOUT')
	    {
	    	console.log("offset: " + offset + ", elapsed: Timeout");
	    }
	    else if(err && err != "undefined")
	    {
		    console.log("exec ngsp_GetAuthLog error");
		    console.log(err);
		    return;
	    }
	    else
	    {
		    var end = Date.now();

		    //console.log(recordsets);

		    console.log("offset: " + offset + ", elapsed: " + (end-start));

		    currCount++;
		    if(currCount<REPEAT_COUNT)
		    {
		    	exec_GetAuthLog(connection, currCount * EXPANSION)
		    }
		    else
		    {
		    	connection.close();
		    	console.log("Done.")
		    }
	    }
	});
}

var connection = new sql.Connection(config, function (err) {
    if(err && err != "undefined")
    {
	    console.log("connection error");
	    console.log(err);
	    return;
    }

	console.log("Page Count: " + MAXCOUNT + ", Repeat: " + REPEAT_COUNT + ", Offset Expansion: " + EXPANSION);

	exec_GetAuthLog(connection, 0);
});
