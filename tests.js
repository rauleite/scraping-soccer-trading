var _ = require('lodash')
var fs = require('fs')
var XLSX = require('xlsx'); 
var json2xls = require('json2xls');
var moment = require('moment');

var list = [];

list[0] = ['raul', 'stone'];

// list[1,[0]] = 'abreu';
// list[1,[1]] = 'leite';

console.log(list.length)
console.log(list[0][0])
console.log(list[0][1])

list[0].push('djoko')

console.log(list[0][2])

list[0][3] = 'aaa'

console.log(list[0][3])

var linha = '\n';
var coluna = ',';

var test = linha + coluna + 'a' + coluna + 'b';

console.log(test)

var PATH_FILE = 'Files/';
var FILE_NAME = 'GOLS_MODELO.ods';

// fs.access(PATH_FILE + 'test.ods', fs.F_OK, function(err) {
//     if (!err) {
//         // Do something
//     } else {
//         var readStreamOriginal = fs.createReadStream(PATH_FILE + FILE_NAME, {autoClose: false});

// 		readStreamOriginal.on('error', function (error) {
// 			throw 'File ERROR: ' + error 
// 		});

// 		// var readStreamCopy = fs.createWriteStream(PATH_FILE + 'test.ods');

// 		// readStreamCopy.on('error', function (error) {
// 		// 	throw 'File ERROR: ' + error 
// 		// });

// 		// readStreamOriginal.pipe(readStreamCopy);

		
// 		/* set up workbook objects -- some of these will not be required in the future */

// 	}
// });

			


		// var wb = {}
		// wb.Sheets = {};
		// wb.Props = {};
		// wb.SSF = {};
		// wb.SheetNames = [];

		// var ws = {};


		// /* create worksheet: */
		// var cell = {v: 'a', t: 's'};

	 // 	var cellRef = XLSX.utils.encode_cell({c:2,r:2});
	 // 	// console.log('C-3')

		// ws['A-1'] = cell;
		// console.log(ws)

		// /* add worksheet to workbook */
		// wb.SheetNames.push('test');
		// wb.Sheets['test'] = ws;



		// XLSX.writeFile(wb, PATH_FILE + 'test.xlsx')
		// 
		
		// var jsonArr = [
		// 	{
		// 	    Jogo: '',
		// 	    Match: 'a x b',
		// 	    1: '15',
		// 	    2: '45',
		// 	    3: '70',
		// 	    4: '',
		// 	    5: '',
		// 	    6: '',
		// 	    7: '',
		// 	    8: '',
		// 	    9: '',
		// 	    10: ''
		// 	},
		// 	{
		// 	    Jogo: '',
		// 	    Match: 'http://',
		// 	    1: '80',
		// 	    2: '',
		// 	    3: '',
		// 	    4: '',
		// 	    5: '',
		// 	    6: '',
		// 	    7: '',
		// 	    8: '',
		// 	    9: '',
		// 	    10: ''
		// 	}

		// ]
		// var xls = json2xls(jsonArr, {fields: ['Jogo', 'Match', '1','2','3','4','5','6','7','8','9', '10' ]});
		// var stream = fs.createWriteStream(PATH_FILE + 'test.xlsx',  {encoding: 'binary', flags: 'a'});
		// stream.write(xls);


		// var stream = fs.createWriteStream(PATH_FILE + 'oi.txt');
		// stream.write('oioi')



// fs.access(PATH_FILE + 'test.xlsx', fs.F_OK, function(err) {

// 							// If file not exists 
// 						    if (err) {
// 								var streamCreate = fs.createWriteStream(PATH_FILE + 'test.xlsx', {encoding: 'binary'});

// 								streamCreate.on('error', function (error) {
// 									throw 'File ERROR: ' + error 
// 								});

// 								streamCreate.on('open', function (fd) {

// console.log('1---------->')
									
// 									this.write('a');

// 								})
								

// 						    } else {
// 								var streamAppend = fs.createWriteStream(PATH_FILE + 'test.xlsx',  {
// 									encoding: 'binary', flags: 'a'});

// 								streamAppend.on('error', function (error) {
// 									throw 'File ERROR: ' + error 
// 								});

// 								streamAppend.on('open', function (fd) {
// 									var xls = json2xls([{1: 'c'}, {2: 'd'}], {fields: [
// 										'Jogo', 'Match', '1','2','3','4','5','6','7','8','9', '10' ]});
// 		console.log('2---------->')

// 									this.write('b');

// 								})
// 							}


// 						});

for(var i =0; i< 10; i++) {

	var streamAppend = fs.createWriteStream(PATH_FILE + 'test2.xlsx',  {encoding: 'binary', flags: 'a'});

	streamAppend.on('error', function (error) {
		throw 'File ERROR: ' + error 
	});

	streamAppend.on('open', function (fd) {
		var xls = json2xls([{1: 'c'}, {2: 'd'}], {fields: [
			'Jogo', 'Match', '1','2','3','4','5','6','7','8','9', '10' ]});
		console.log('2---------->')

		this.write('b');
	});

};


console.log(11)
_.each(['','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',''], function(i, v) {
	console.log(i, v)
	// console.log(22)
})

console.log(33)

for(var i = 0; i <= (5 - 1); i++) {
	console.log('for', i === (5 - 1));

}

var now = new Date();
console.log(now.getFullYear(), now.getMonth(), now.getDay(), now.getHours())

var now = moment().format();

console.log(now)

console.log(isNaN('HT'))