// 将科学计数法转换成小数
export const scientificToNumber = function (num) {
	var str = num.toString();
	var reg = /^(\d+)(e)([-]?\d+)$/;
	var arr, len,
		zero = '';

	/*6e7或6e+7 都会自动转换数值*/
	if (!reg.test(str)) {
		return num;
	} else {
		/*6e-7 需要手动转换*/
		arr = reg.exec(str);
		len = Math.abs(arr[3]) - 1;
		for (var i = 0; i < len; i++) {
			zero += '0';
		}
		return '0.' + zero + arr[1];
	}
}

export const addressShow = function (address, beforelen = 6, lastlen = 4) {
	if (address) {
		let beforSixstr = address.substring(0, beforelen);
		let lastFourstr = address.substring(address.length - lastlen);
		return beforSixstr + '...' + lastFourstr;
	} else {
		return '';
	}
}


export const formatnumber = function(value, num) {
	var a, b, c, i;
	a = value.toString();
	b = a.indexOf(".");
	c = a.length;
	if (num == 0) {
		if (b != -1) {
			a = a.substring(0, b);
		}
	} else {
		if (b == -1) {
			a = a + ".";
			for (i = 1; i <= num; i++) {
				a = a + "0";
			}
		} else {
			a = a.substring(0, b + num + 1);
			for (i = c; i <= b + num; i++) {
				a = a + "0";
			}
		}
	}
	return a;
}

// 转换为格式时间
export const getTimeNow = function (time) {
	var date = new Date(time); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var year = date.getFullYear();
	var month = ('0' + (date.getMonth() + 1)).slice(-2);
	var day = ('0' + date.getDate()).slice(-2);
	var hour = ('0' + date.getHours()).slice(-2);
	var minute = ('0' + date.getMinutes()).slice(-2);
	var second = ('0' + date.getSeconds()).slice(-2);
	// var timer = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
	var timer = day + '天' + hour + ':' + minute + ':' + second;
	return timer;
}