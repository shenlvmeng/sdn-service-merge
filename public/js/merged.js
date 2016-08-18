(function(){
	var graph = {};
	$.get('/graph', function(data){
		graph = data;

		$('body').animate({
			'opacity': 1
		}, 2000, 'easeInCubic');
		var width = $('svg.topo').width();
		var height = $('svg.topo').height();

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
			.linkDistance(80)
			.charge(-300)
			.start();
		//console.log(force.nodes());

		var svg_links = d3.select('svg.topo')
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
		var svg_nodes = d3.select('svg.topo')
			.selectAll('text')
			.data(nodes)
			.enter()
			.append('text')
			.attr({
				'font-family': 'FontAwesome',
				'font-size': '25', 'fill': "#aaa",
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
		var svg_texts = d3.select('svg.topo')
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

		var list = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];
		//add deny button: change color and send ban request
		$("button.add_d").on('click', function(){			
			var d_ip = $(this).parent().find('input').val().trim();
			var index = list.indexOf(d_ip);
			if(index == -1) alert('Unknown host ip!');
			if($('svg text[did='+ (index+1) +']').attr('fill') != 'red'){
				$('svg text[did='+ (index+1) +']').attr('fill', 'red');
				$('svg line[lid='+ (index+1) +']').attr('stroke', 'red');
				//some ajax request
				$.post("/firewall", { ip: d_ip, type: 'deny' });
			};
		});
		//add allow button: change color and send allow request
		$("button.add_a").on('click', function(){
			var a_ip = $(this).parent().find('input').val().trim();
			var index = list.indexOf(a_ip);
			if(index == -1) alert('Unknown host ip!');
			if($('svg text[did='+ (index+1) +']').attr('fill') != 'steelblue'){
				$('svg text[did='+ (index+1) +']').attr('fill', 'steelblue');
				$('svg line[lid='+ (index+1) +']').attr('stroke', 'steelblue');
				//some ajax request
				$.post("/firewall", { ip: a_ip, type: 'allow' });
			};
		});

		//draw logic graph
		var defs = 	d3.select('svg.graph').append('defs');
		defs.append('marker')
			.attr({
				'id': 'arrow', 'viewBox': "0 -5 10 10",
				'refX': 5, 'refY': 0,
				'markerWidth': 3, 'markerHeight': 3,
				'orient': 'auto',
				'stroke-width': 1, 'fill': '#ccc'
			})
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5');
		width = $('svg.graph').width();
		height = $('svg.graph').height();

		var nodes_2 = graph.nodes;
		var links_2 = graph.links;
		var force2 = d3.layout.force()
			.nodes(nodes_2)
			.links(links_2)
			.size([width, height])
			.linkDistance(100)
			.charge(-1000)
			.start();
		//console.log(force.nodes());

		var svg_links2 = d3.select('svg.graph')
			.selectAll('line')
			.data(links_2)
			.enter()
			.append('polyline')
			.attr({
				'stroke': '#ccc', 'stroke-width': 2,
				'marker-mid' : 'url(#arrow)'
			});
		var svg_nodes2 = d3.select('svg.graph')
			.selectAll('ellipse')
			.data(nodes_2)
			.enter()
			.append('rect')
			.attr({
				'width': 50, 'height': 25,
				'rx': function(d){
					if(d.type == 'node') return 50;
					else return 0;
				},
				'ry': function(d){
					if(d.type == 'node') return 25;
					else return 0;
				},
				'fill': function(d){
					if(d.type == 'port') return 'tomato';
					else return 'steelblue';
				},
				'transform': "translate(-25,-12)"
			})
			.on('dblclick', function(d){
				d.fixed = false;
			})
			.call(force2.drag); //this line can be commented
		var svg_texts2 = d3.select('svg.graph')
			.selectAll('text.text')
			.data(nodes_2)
			.enter()
			.append('text')
			.attr({
				'stroke': "#fff",
				'text-anchor': 'middle',
				'alignment-baseline': 'middle'
			})
			.style('font-family', 'Arial')
			.text(function(d){
				return d.name;
			});
		force2.on('tick', function(){
			svg_links2.attr("points", function(d) {
      			return d.source.x + "," + d.source.y + " " + 
		            (d.source.x + d.target.x)/2 + "," + (d.source.y + d.target.y)/2 + " " +
		            d.target.x + "," + d.target.y;
	         });
			svg_nodes2.attr({
				'cx': function(d) {return d.x = Math.max(50, Math.min(d.x, width -50));},
				'cy': function(d) {return d.y = Math.max(50, Math.min(d.y, height-50));}
			});
			svg_texts2.attr({
				'x': function(d) { return d.x; },
				'y': function(d) { return d.y; }
			});
		});
		//add node fixed
		force2.drag()
			.on('dragstart', function(d,i){
				d.fixed = true;
			});

		//fire a terminal
		$("button#terminal").on('click', function(){
			$.get('/terminal');
		});
		
	});
})();