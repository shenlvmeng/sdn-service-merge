(function(){
	$().ready(function(){
		//draw the topology
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
			.linkDistance(80)
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

		//ajax update flow chart and fees
		var refreshId = setInterval(function(){
			$.ajax({
				url: '/fee',
				success: function(fee){
					fee.forEach(function(val, i){
						var tmpstr = $('#fee p:nth-child('+ (i+1) +')').html().substr(0,24);
						$('#fee p:nth-child('+ (i+1) +')').html(tmpstr+'￥'+val);
					});
				}
			});
		}, 5000);
		function fetchData(){
			$.ajax({
				url: '/flow',
				success: function(fee){
					//shift old points
					var series = chart.series[0],
						shift  = series.data.length > 10,
						point = [Date.now()+3600*8000, fee.flow];
					//add a point
					chart.series[0].addPoint(point, true, shift);
					//call it after 5s
					setTimeout(fetchData, 5000);
				},
				cache: false
			});
		}
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: 'flow',
				events: { load : fetchData }
			},
			title:{
				text: '路径实时流量'
			},
			xAxis: {
				type: 'datetime',
				tickPixelInterval: 150
			},
			yAxis: {
				minPadding: 0.2,
				maxPadding: 0.2,
				title: {
					text: "Flow data(Kb)"
				}
			},
			series: [{
				name: 'Flow data',
				data: []
			}]
		});

		var nodeMap = ["H1", "H2", "H3", "S1", "S2", "S3", "S4", "DB", "Web Server1", "Web Server2"];
		//path search button
		$("#path #search").on('click', function(){
			var src = $("#path span:nth-child(1) select").val();
			var dst = $("#path span:nth-child(2) select").val();
			$.post('/path', {src: src, dst: dst}, function(data){
				//data = {nodes: [0,3,4,5,7], links: [0,3,4,6]};
				if(!data){
					alert('Unknown path.');
					return false;
				}
				data.nodes.forEach(function(val){
					$('svg text[did='+ (val+1) +']').attr('fill', 'steelblue');
				});
				data.links.forEach(function(val){
					$('svg line[lid='+ (val+1) +']').attr('stroke', 'steelblue');
				});
				var path = "";
				$('#path p').html(function(){
					data.nodes.forEach(function(val){
						path += (nodeMap[val] + "->");
					});
					return path.slice(0,-2);
				});
			});
		})
		//merge button -- canceled
	});
})();