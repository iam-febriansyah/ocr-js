$( document ).ready(function() {
	var inputs = document.querySelectorAll( '.inputfile' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			document.getElementById('showImage').style.display = 'block';
			document.getElementById('showArrow').style.display = 'block';
			document.getElementById('showLog').style.display = 'block';
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName ){
				label.querySelector( 'span' ).innerHTML += fileName;

				let reader = new FileReader();
				reader.onload = function () {
					let dataURL = reader.result;
					$("#selected-image").attr("src", dataURL);
					$("#selected-image").addClass("col-12");
				}
				let file = this.files[0];
				reader.readAsDataURL(file);
				startRecognize(file);
			}
			else{
				label.innerHTML = labelVal;
				$("#selected-image").attr("src", '');
				$("#selected-image").removeClass("col-12");
				$("#arrow-right").addClass("fa-arrow-right");
				$("#arrow-right").removeClass("fa-check");
				$("#arrow-right").removeClass("fa-spinner fa-spin");
				$("#arrow-down").addClass("fa-arrow-down");
				$("#arrow-down").removeClass("fa-check");
				$("#arrow-down").removeClass("fa-spinner fa-spin");
				$("#log").empty();
			}
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	});
});

$("#startLink").click(function () {
	var img = document.getElementById('selected-image');
	startRecognize(img);
});

function startRecognize(img){
	$("#arrow-right").removeClass("fa-arrow-right");
	$("#arrow-right").addClass("fa-spinner fa-spin");
	$("#arrow-down").removeClass("fa-arrow-down");
	$("#arrow-down").addClass("fa-spinner fa-spin");
	recognizeFile(img);
}

function progressUpdate(packet){
	var log = document.getElementById('log');

	if(log.firstChild && log.firstChild.status === packet.status){
		if('progress' in packet){
			var progress = log.firstChild.querySelector('progress')
			progress.value = packet.progress
		}
	}else{
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div')
		status.className = 'status'
		status.appendChild(document.createTextNode(packet.status))
		line.appendChild(status)

		if('progress' in packet){
			var progress = document.createElement('progress')
			progress.value = packet.progress
			progress.max = 1
			line.appendChild(progress)
		}


		if(packet.status == 'done'){
			log.innerHTML = ''
			var pre = document.createElement('pre')
			pre.appendChild(document.createTextNode(packet.data.text.replace(/\n\s*\n/g, '\n')))
			line.innerHTML = ''
			line.appendChild(pre)
			$(".fas").removeClass('fa-spinner fa-spin')
			$(".fas").addClass('fa-check')
		}

		log.insertBefore(line, log.firstChild)
	}
}

function replaceBulk( str, findArray, replaceArray ){
  var i, regex = [], map = {}; 
  for( i=0; i<findArray.length; i++ ){ 
    regex.push( findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g,'\\$1') );
    map[findArray[i]] = replaceArray[i]; 
  }
  regex = regex.join('|');
  str = str.replace( new RegExp( regex, 'g' ), function(matched){
    return map[matched];
  });
  return str;
}

function recognizeFile(file){
	$("#log").empty();
  	const corePath = window.navigator.userAgent.indexOf("Edge") > -1
    ? 'js/tesseract-core.asm.js'
    : 'js/tesseract-core.wasm.js';


	const worker = new Tesseract.TesseractWorker({
		corePath,
	});

	worker.recognize(file,
		$("#langsel").val()
	).progress(function(packet){
		console.info(packet)
		percen = packet.progress * 100; 
		console.log(percen)
		document.getElementById('percenprogress').innerHTML = packet.status.toUpperCase();
		if(packet.status == 'recognizing text'){
			document.getElementById('percenprogress').innerHTML = 'Progress convert to text <b>' +percen.toFixed(0) + '%</b>';
			if(percen.toFixed(0) >= 100){
				document.getElementById('idTable').style.display = 'block'
			}
		}
		progressUpdate(packet)

	})
	.then(function(data){
		console.log(data);
		var replaceAbsurd = replaceBulk( data.text, ["}","{","¢", "%", "~", "©", "o", "_", "—", "#", "’", "“", "”", "’", "|", "=", "?", "]", "["], ['','','','','','','','','','','','','','','','','','',''] );
		var trim = replaceAbsurd.trim();
		var array = trim.split('\n') 
		console.log(trim)
		console.log(array)
		let sProv 	= 'PROVINSI';
		let arrProv = array.filter(o => o.includes(sProv));
		let resProv = arrProv.length > 0 ? arrProv[0] : "Provinsi not detected";

		let sKab 	= 'KABUPATEN';
		let arrKab = array.filter(o => o.includes(sKab));
		let resKab = arrKab.length > 0 ? arrKab[0] : "KABUPATEN not detected";
		let sKota 	= 'KOTA';
		let arrKota = array.filter(o => o.includes(sKota));
		let resKota = arrKota.length > 0 ? arrKota[0] : "KOTA not detected";
		let resKotaKab = resKota +""+ resKab;
		if(arrKab.length > 0){
			resKotaKab = resKab;
		}else if(arrKab.length > 0){
			resKotaKab = resKota;
		}else{
			let arrJKTSelatan = array.filter(o => o.includes('JAKARTA SELATAN'));
			let arrJKTTIMUR = array.filter(o => o.includes('JAKARTA TIMUR'));
			let arrJKTUTARA = array.filter(o => o.includes('JAKARTA UTARA'));
			let arrJKTBARAT = array.filter(o => o.includes('JAKARTA BARAT'));
			let arrJKTPUSAT = array.filter(o => o.includes('JAKARTA PUSAT'));
			if(arrJKTSelatan.length > 0){
				resKotaKab = 'JAKARTA SELATAN';
			}else if(arrJKTTIMUR.length > 0){
				resKotaKab = 'JAKARTA TIMUR';
			}else if(arrJKTUTARA.length > 0){
				resKotaKab = 'JAKARTA UTARA';
			}else if(arrJKTBARAT.length > 0){
				resKotaKab = 'JAKARTA BARAT';
			}else if(arrJKTPUSAT.length > 0){
				resKotaKab = 'JAKARTA PUSAT';
			}else{
				resKotaKab = 'Kota not detected';
			}
		}

		let sNik 	= 'NIK';
		let arrNik = array.filter(o => o.includes(sNik));
		let resNik = arrNik.length > 0 ? arrNik[0] : "NIK not detected";

		let sNama 	= 'Nama';
		let arrNama = array.filter(o => o.includes(sNama));
		let resNama = arrNama.length > 0 ? arrNama[0] : "Nama not detected";

		let sTtl 	= 'Tempat';
		let arrTtl = array.filter(o => o.includes(sTtl));
		let resTtl = arrTtl.length > 0 ? arrTtl[0] : "Tempat Tanggal/Lahir not detected";

		let sJK 	= 'Kelamin';
		let arrJK = array.filter(o => o.includes(sJK));
		let arrWanita = arrJK.filter(o => o.includes('WANITA'));
		let arrLaki = arrJK.filter(o => o.includes('LAKI-LAKI'));
		let arrPerempuan = arrJK.filter(o => o.includes('PEREMPUAN'));
		if(arrWanita.length > 0){
			resJK = 'WANITA';
		}else if(arrLaki.length > 0){
			resJK = 'LAKI-LAKI';
		}else if(arrPerempuan.length > 0){
			resJK = 'PEREMPUAN';
		}else{
			resJK = "Jenis Kelamin not detected";
		}

		let sAlamat 	= 'Alamat';
		let arrAlamat = array.filter(o => o.includes(sAlamat));
		let resAlamat = arrAlamat.length > 0 ? arrAlamat[0] : "Alamat not detected";

		let sRTRW 	= 'RTRW';
		let arrRTRW = array.filter(o => o.includes(sRTRW));
		let resRTRW = arrRTRW.length > 0 ? arrRTRW[0] : "RT/RW not detected";

		let sDesa 	= 'KelDesa';
		let arrDesa = array.filter(o => o.includes(sDesa));
		let resDesa = arrDesa.length > 0 ? arrDesa[0] : "Desa not detected";

		let sKecamatan 	= 'Kecamatan';
		let arrKecamatan = array.filter(o => o.includes(sKecamatan));
		let resKecamatan = arrKecamatan.length > 0 ? arrKecamatan[0] : "Kecamatan not detected";

		let sAgama 	= 'Agama';
		let arrAgama = array.filter(o => o.includes(sAgama));
		let resAgama = arrAgama.length > 0 ? arrAgama[0] : "Agama not detected";

		let sStatus 	= 'Status';
		let arrStatus = array.filter(o => o.includes(sStatus));
		let resStatus = arrStatus.length > 0 ? arrStatus[0] : "Status Kawin not detected";

		let sPekerjaan 	= 'Pekerjaan';
		let arrPekerjaan = array.filter(o => o.includes(sPekerjaan));
		let resPekerjaan = arrPekerjaan.length > 0 ? arrPekerjaan[0] : "Pekerjaan not detected";

		let sWNI 	= 'negara';
		let arrWNI = array.filter(o => o.includes(sWNI));
		let resWNI = arrWNI.length > 0 ? arrWNI[0] : "Kewarganegaraan not detected";

		console.log(resProv);
		console.log(resKotaKab);
		console.log(resNik);
		console.log(resNama);
		console.log(resTtl);
		console.log(resJK);
		console.log(resAlamat);
		console.log(resRTRW);
		console.log(resDesa);
		console.log(resKecamatan);
		console.log(resAgama);
		console.log(resStatus);
		console.log(resPekerjaan);
		console.log(resWNI);

		let provinsi = replaceBulk( resProv, [":","-"], ['','']).trim().replace(/[0-9]/g, '');
		let kotaKabupaten = replaceBulk( resKotaKab, [":","-"], ['','']).trim().replace(/[0-9]/g, '');
		let nik = replaceBulk( resNik, [":","-",'NIK'], ['','','']).trim();
		let nama = replaceBulk( resNama, [":","-",'Nama'], ['','','']).trim().replace(/[0-9]/g, '');
		let ttl = replaceBulk( resTtl, [":",'Tempat/Tgl Lahir'], ['','']).trim();
		let jk = resJK
		let alamat = replaceBulk( resAlamat, [":",'Alamat'], ['','']).trim();
		let rtrw = "RT/RW " + replaceBulk( resRTRW, [":",'RT/RW','RT','RW'], ['','','','']).trim();
		let desa = "Kel/Desa " +  replaceBulk( resDesa, [":",'Kel/Desa','Kel','Desa','KelDesa'], ['','','','','']).trim().replace(/[0-9]/g, '');
		let kec = "Kec. " + replaceBulk( resKecamatan, [":",'Kecamatan'], ['','']).trim().replace(/[0-9]/g, '');
		let agama = replaceBulk( resAgama, [":",'Agama'], ['','']).trim().replace(/[0-9]/g, '');
		let statusKawin = replaceBulk( resStatus, [":",'Status Perkawinan'], ['','']).trim().replace(/[0-9]/g, '');
		let pekerjaan = replaceBulk( resPekerjaan, [":",'Pekerjaan','.'], ['','','']).trim().replace(/[0-9]/g, '');

		document.getElementById('provinsi').innerHTML = provinsi
		document.getElementById('kabupaten').innerHTML = kotaKabupaten
		document.getElementById('nik').innerHTML = nik
		document.getElementById('nama').innerHTML = nama
		document.getElementById('ttl').innerHTML = ttl
		document.getElementById('jk').innerHTML = jk
		document.getElementById('alamat').innerHTML = alamat
		document.getElementById('rtRW').innerHTML = rtrw
		document.getElementById('desa').innerHTML = desa
		document.getElementById('kec').innerHTML = kec
		document.getElementById('agama').innerHTML = agama
		document.getElementById('status').innerHTML = statusKawin
		document.getElementById('pekerjaan').innerHTML = pekerjaan
		progressUpdate({ status: 'done', data: data })
	})
}

function upload(){
	var btn = document.getElementById("btnSaveSign");
	btn.value = 'Loading ...';
	btn.innerHTML = 'Loading ...';
	btn.disabled = true;
	var file_data = $('#image_name').prop('files')[0];
	var link = $('#link').val();
	var isvisit = $('#visitvirtual').val();
	var form_data = new FormData();
	form_data.append('foto', file_data);
	form_data.append('unit_code', '');
	form_data.append('link', link);
	console.log(file_data)
	$isPost = true;
	if(isvisit == 'visit'){
		form_data.append('isvisit', 'VISIT');
		if ($('#image_name').get(0).files.length === 0) {
			showErrorDetail("Anda harus memasukan foto bukti handover");
			$isPost = false;
		}
	}else{
		form_data.append('isvisit', 'VIRTUAL');
		if(link == ""){
			showErrorDetail("Anda harus memasukan link bukti percakapan handover");
			$isPost = false;
		}
	}
	var isBast = '<?=$isBast;?>';
	var isBastCheck = '<?=$isBastCheck;?>';
	var isDefect = '<?=$isDefect;?>';
	var isHouse = '<?=$isHouse;?>';
	var isPayment  = '<?=$isPayment;?>';
	if(isBast == ""){
		showErrorDetail("Anda harus menanda tangani BAST");
		$isPost = false;
	}
	if(isBastCheck == ""){
		showErrorDetail("Anda harus menanda tangani Berita Acara");
		$isPost = false;
	}
	if(isDefect == ""){
		showErrorDetail("Anda harus menanda tangani Defect List");
		$isPost = false;
	}
	if(isHouse == ""){
		showErrorDetail("Anda harus menanda tangani House Rules");
		$isPost = false;
	}
	if(isPayment == ""){
		showErrorDetail("Anda harus menanda tangani Payment Document");
		$isPost = false;
	}


	if($isPost){
		$.ajax({
			url         : './modules/handover/save_done_ho.php',
			type        : 'post',
			cache       : false,
			contentType : false,
			processData : false,
			data        : form_data,
			success     : function(response){
				var res = JSON.parse(response)
				console.log(res)
				if(res){
					sendMail();
				}else{
					showErrorDetail(res.remarks)
				}
			}
		});
	}
}