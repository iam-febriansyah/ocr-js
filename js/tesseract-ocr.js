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
		console.log(data)
		var replaceAbsurd = data.text.replace("=", "").replace("%", "").replace("~", "").replace("©", "").replace("o", "").replace("_", "").replace("——", "").replace("—", "");
		var replaceAbsurd1 = replaceAbsurd.replace("— ", "");
		var replaceAbsurd2 = replaceAbsurd1.replace("~~", "");
		var replaceAbsurd3 = replaceAbsurd2.replace("- ", "");
		var replaceEnter = replaceAbsurd3.replace(/\n{1,}/g, '\n');
		var replaceNIK = replaceEnter.replace("NIK", "");
		var replaceNama = replaceNIK.replace("Nama", "");
		var replaceTtl = replaceNama.replace("Tempat/Tgl Lahir", "");
		var replaceJK = replaceTtl.replace("Jenis kelamin", "");
		var replaceAlamat = replaceJK.replace("Alamat", "");
		var replaceAgama = replaceAlamat.replace("Agama", "");
		var replaceStatus = replaceAgama.replace("Status Perkawinan", "");
		var replacePekerjaan = replaceStatus.replace("Pekerjaan", "");
		var trim = replacePekerjaan.trim();
		var array = trim.split('\n')
		console.log(trim)
		console.log(array)
		var provinsi = array[0].trim();
		var kabupaten = array[1].trim();
		var nikReplace = array[2].replace(":", "");
		var nik = nikReplace.trim();
		var namaReplace = array[3].replace(":", "");
		var nama = namaReplace.trim();
		var ttlReplace = array[4].replace(":", "");
		var ttl = ttlReplace.trim();
		var jktReplace = array[5].replace(":", "");
		var jk = jktReplace.trim();
		var alamatReplace = array[6].replace(":", "");
		var alamat = alamatReplace.trim();
		var rtRWReplace = array[7].replace(":", "");
		var rtRW = rtRWReplace.trim();
		var desaReplace = array[8].replace(":", "");
		var desa = desaReplace.trim();
		var kecReplace = array[9].replace(":", "");
		var kec = kecReplace.trim();
		var agamaReplace = array[10].replace(":", "");
		var agama = agamaReplace.trim();
		var statusReplace = array[11].replace(":", "");
		var status = statusReplace.trim();
		var pekerjaanReplace = array[12].replace(":", "");
		var pekerjaan = pekerjaanReplace.trim();

		document.getElementById('provinsi').innerHTML = provinsi;
		document.getElementById('kabupaten').innerHTML = kabupaten;
		document.getElementById('nik').innerHTML = nik;
		document.getElementById('nama').innerHTML = nama;
		document.getElementById('ttl').innerHTML = ttl;
		document.getElementById('jk').innerHTML = jk;
		document.getElementById('alamat').innerHTML = alamat;
		document.getElementById('rtRW').innerHTML = rtRW;
		document.getElementById('desa').innerHTML = desa;
		document.getElementById('kec').innerHTML = kec;
		document.getElementById('agama').innerHTML = agama;
		document.getElementById('status').innerHTML = status;
		document.getElementById('pekerjaan').innerHTML = pekerjaan;
		progressUpdate({ status: 'done', data: data })
	})
}