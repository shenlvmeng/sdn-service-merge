(function(){
	$().ready(function(){
		var width = $('svg').width();
		var height = $('svg').height();

		var nodes = d3.range(1,11).map(function(i){
			if(i < 4) return {name: "H" + i};
			else if(i > 3 && i < 8) return {name: "S" + (i - 3)};
			else if(i > 8 && i < 11) return {name: "Web Server" + (i-8)};
			else return {name: "DB"};
		});
		var links = [{source: 0, target: 3}, {source: 1, target: 3},
			{source: 2, target: 3}, {source: 3, target: 4},
			{source: 4, target: 5}, {source: 4, target: 6},
			{source: 5, target: 7}, {source: 6, target: 8},
			{source: 6, target: 9}
		];
		var force = d3.layout.force()
			.nodes(nodes)
			.links(links)
			.size([width, height])
			.linkDistance(120)
			.charge(-300)
			.start();
		//console.log(force.nodes());

		var svg_links = d3.select('svg')
			.selectAll('line')
			.data(links)
			.enter()
			.append('line')
			.attr({
				'stroke': '#ccc', 'stroke-width': 2,
				'lid': function(d, i){
					return i+1;
				}
			});
		var svg_nodes = d3.select('svg')
			.selectAll('text')
			.data(nodes)
			.enter()
			.append('text')
			.attr({
				'font-family': 'FontAwesome',
				'font-size': '30', 'fill': "#aaa",
				'did': function(d, i){
					return i+1;
				}
			})
			.text(function(d, i){
				if(i < 3) return '\uf108';
				else if(i > 2 && i < 7) return '\uf233';
				else if(i > 7 && i < 10) return '\uf0ac';
				else return '\uf1c0';
			})
			.on('dblclick', function(d){
				d.fixed = false;
			})
			.call(force.drag); //this line can be commented
		var svg_texts = d3.select('svg')
			.selectAll('text.text')
			.data(nodes)
			.enter()
			.append('text')
			.attr({
				'dx': 15, 'dy': 10, 'fill': '#333'
			})
			.style('font-family', 'Calibri')
			.text(function(d){
				return d.name;
			});

		force.on('tick', function(){
			svg_links.attr("x1", function(d) { return d.source.x + 8; })
				.attr("y1", function(d) { return d.source.y - 8; })
				.attr("x2", function(d) { return d.target.x + 8; })
				.attr("y2", function(d) { return d.target.y - 8; });
			svg_nodes.attr({
				'x': function(d) {return d.x = Math.max(20, Math.min(d.x, width-20));},
				'y': function(d) {return d.y = Math.max(20, Math.min(d.y, height-20));}
			});
			svg_texts.attr({
				'x': function(d) {return d.x;},
				'y': function(d) {return d.y;}
			});
		});
		//add node fixed
		force.drag()
			.on('dragstart', function(d,i){
				d.fixed = true;
			});

		//prepainting
		if($('.button').css('margin-right') == "31px"){
			if($('.highlight a').html() == "Billing"){
				[1,2,4,5,7,9,10].forEach(function(val){
					$('svg text[did='+ val +']').attr('fill', 'orange');
				});
				[1,2,4,6,8,9].forEach(function(val){
					$('svg line[lid='+ val +']').attr('stroke', 'orange');
				});
			} else {
				[9,10].forEach(function(val){
					$('svg text[did='+ val +']').attr('fill', 'green');
				});
				[8,9].forEach(function(val){
					$('svg line[lid='+ val +']').attr('stroke', 'green');
				});
			}
		} else {
			if($('.highlight a').html() != "Billing"){
				$('svg text[did=9]').attr('fill', 'steelblue');
				$('svg line[lid=8]').attr('stroke', 'steelblue');
			}
		}

		//switch button
		$("span.button").on('click', function(){
			var self = $(this);
			var name = "";
			if($('.highlight a').html() == "Billing") name = "Billing";
			else name = "Balance";

			if(!self.css('margin-right') || self.css('margin-right') != "31px")
				self.animate({
					'margin-right': '31px'
				},100,'swing',function(){
					self.parent().css("background-color", "limegreen");
					if(name == "Balance"){
						[9,10].forEach(function(val){
							$('svg text[did='+ val +']').attr('fill', 'green');
						});
						[8,9].forEach(function(val){
							$('svg line[lid='+ val +']').attr('stroke', 'green');
						});
					} else if(name == "Billing"){
						[1,2,4,5,7,9,10].forEach(function(val){
							$('svg text[did='+ val +']').attr('fill', 'orange');
						});
						[1,2,4,6,8,9].forEach(function(val){
							$('svg line[lid='+ val +']').attr('stroke', 'orange');
						});
					}
					$.post("/modules", { name: name, status: 1 });
				});
			else
				self.animate({
					'margin-right': '0'
				},100,'swing',function(){
					self.parent().css("background-color", "#aaa");
					if(name == "Balance"){
						$('svg text[did=10]').attr('fill', '#aaa');
						$('svg line[lid=9]').attr('stroke', '#aaa');
						$('svg text[did=9]').attr('fill', 'steelblue');
						$('svg line[lid=8]').attr('stroke', 'steelblue');
					} else if(name == "Billing"){
						[1,2,4,5,7,9,10].forEach(function(val){
							$('svg text[did='+ val +']').attr('fill', '#aaa');
						});
						[1,2,4,6,8,9].forEach(function(val){
							$('svg line[lid='+ val +']').attr('stroke', '#aaa');
						});
					}
					$.post("/modules", { name: name, status: 0 });
				});
			return false;
		});

		//fire a terminal
		$("button#terminal").on('click', function(){
			$.get('/terminal');
		});

		//merge button
		$("button#merge_b").on('click', function(){
			$.get('/modules', function(data){
				if(data.length == 0){
					alert("模块为空！");
					return false;
				}
				$('body').animate({
					'opacity': 0
				}, 1500, 'easeOutCubic', function(){
					window.location.href = "/merged";
				});
			});		
		});
	});
})();