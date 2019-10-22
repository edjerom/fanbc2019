var anim_speed = 300
$(document).ready(function(){
	$('#start_category_search').click(function(){
		parse_category($('#category_url').val())
	})
	$('#clear_results').click(function(){
		var count = $('.product_box').length
		$('.product_box').each(function(){
			
		$(this).delay(anim_speed*count/2).hide('fast',function(){$(this).remove()})
			count--
		})
	})
	function displayProduct(product,timeout) {
		setTimeout(function(){
								
			$('#contacts').append('<div class="product_box col-xl-2 col-lg-3 col-sm-4 col-6">' +
				'<div class="contacts__item animated jackInTheBox">' +
					'<a href="'+product['product_url']+'" class="contacts__img">' +
						'<img src="'+product['product_img']+'" alt="">' +
					'</a>' +

					'<div class="contacts__info">' +
						'<strong>'+product['product_title']+'</strong>' +
						'<small>'+product['product_price']+'</small>' +
					'</div>' +

					'<button class="contacts__btn">Detail SCAN</button>' +
				'</div></div>')			
			}, timeout);
	}
	function parse_category(category_url){
		
		$.ajax({
				type: "POST",
				url: cur.siteUrl + 'api/parse_category/',
				data: 'url='+encodeURIComponent(category_url),
				async: false,
				success: function(msg) {
					
					var data = (msg !== '') ? JSON.parse(msg) : [];
					//console.log(data)
					var count = 0
					for(i in data['products']){
							//console.log(data['products'][i])
							var product = data['products'][i]
							displayProduct(product,count*anim_speed)
							count++
					}
					
				},
				error: function() {
				}
			});
	}
})