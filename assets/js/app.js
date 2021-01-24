 // Leveraged 16-D3-Day3-Activity12 Homework
 svgWidth = 960;
 svgHeight = 500;

 margin = {
     top: 20,
     right: 40,
     bottom: 100,
     left: 100
 };

 width = svgWidth - margin.left - margin.right;
 height = svgHeight - margin.top - margin.bottom;

 // Create an SVG wrapper, append an SVG group that will hold our chart,
 // and shift the latter by left and top margins.
 svg = d3
     .select('#scatter')
     .append('svg')
     .attr('width', svgWidth)
     .attr('height', svgHeight);

 // Append an SVG group
 chartGroup = svg.append('g')
     .attr('transform', `translate(${margin.left}, ${margin.top})`);

 // Initial Parameters
 chosenXAxis = 'smokes';
 chosenYAxis = 'age';

 // function used for updating x-scale upon click on axis label
 function xScale(censusData, chosenXAxis) {
     // create scales
     xLinearScale = d3.scaleLinear()
         .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
             d3.max(censusData, d => d[chosenXAxis]) * 1.2
         ])
         .range([0, width]);

     return xLinearScale;
 }

 // function used for updating y-scale upon click on axis label
 function yScale(censusData, chosenYAxis) {
     // create scales
     yLinearScale = d3.scaleLinear()
         .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
             d3.max(censusData, d => d[chosenYAxis]) * 1.2
         ])
         .range([height, 0]);

     return yLinearScale;
 }
 // function used for updating xAxis upon click on axis label
 function xRenderAxes(newXScale, xAxis) {
     bottomAxis = d3.axisBottom(newXScale);

     xAxis.transition()
         .duration(1000)
         .call(bottomAxis);

     return xAxis;
 }
 // function used for updating xAxis upon click on axis label
 function yRenderAxes(newYScale, yAxis) {
     leftAxis = d3.axisLeft(newYScale);
     yAxis.transition()
         .duration(1000)
         .call(leftAxis);
     return yAxis;
 }
 // function used for updating circles group with a transition to
 // new circles
 function xRenderCircles(circlesGroup, newXScale, chosenXAxis) {
     circlesGroup.transition()
         .duration(1000)
         .attr('cx', d => newXScale(d[chosenXAxis]));
     return circlesGroup;
 }

 function yRenderCircles(circlesGroup, newYScale, chosenYAxis) {

     circlesGroup.transition()
         .duration(1000)
         .attr('cy', d => newYScale(d[chosenYAxis]));
     return circlesGroup;
 }

 // function used for updating Circle Text group with a transition to
 // new circles
 function renderXCircleText(textCircles, newXScale, chosenXAxis) {

     textCircles.transition()
         .duration(1000)
         .attr('x', d => newXScale(d[chosenXAxis]));

     return textCircles;
 }

 function renderYCircleText(textCircles, newYScale, chosenYAxis) {

     textCircles.transition()
         .duration(1000)
         .attr('y', d => newYScale(d[chosenYAxis]) + 4);

     return textCircles;
 }

 // function used for updating circles group with new tooltip
 function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
     if (chosenXAxis === 'smokes') {
         xlabel = 'Smokers: '
     } else if (chosenXAxis === 'healthcare') {
         xlabel = 'No Healthcare: '
     } else {
         xlabel = 'Obese:';
     }
     if (chosenYAxis === 'age') {
         ylabel = 'Age: '
     } else if (chosenYAxis === 'income') {
         ylabel = 'Income: '
     } else {
         ylabel = 'Poverty: ';
     }
     toolTip = d3.tip()
         .attr('class', 'd3-tip')
         //.offset([40, -60])
         .html(function(d) {
             return (`<strong>${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}<\strong>`);
         });
     circlesGroup.call(toolTip);

     circlesGroup.on('mouseover', function(data, index) {
             toolTip.show(data);
         })
         // onmouseout event
         .on('mouseout', function(data, index) {
             toolTip.hide(data);
         });
     return circlesGroup;
 }

 // Retrieve data from the CSV file
 d3.csv('assets/data/data.csv').then(function(censusData, err) {
     if (err) throw err;
     // Parse data
     censusData.forEach(function(data) {
         data.poverty = +data.poverty;
         data.age = +data.age;
         data.income = +data.income;
         data.healthcare = +data.healthcare;
         data.obesity = +data.obesity;
         data.smokes = +data.smokes;
     });

     // xLinearScale function above csv import
     xLinearScale = xScale(censusData, chosenXAxis);

     // yLinearScale function above csv import
     yLinearScale = yScale(censusData, chosenYAxis);

     // Create initial axis functions
     bottomAxis = d3.axisBottom(xLinearScale);
     leftAxis = d3.axisLeft(yLinearScale);

     // append x axis
     xAxis = chartGroup.append('g')
         .classed('x-axis', true)
         .attr('transform', `translate(0, ${height})`)
         .call(bottomAxis);

     // append y axis
     yAxis = chartGroup.append('g')
         .classed('y-axis', true)
         .call(leftAxis);

     // append initial circles
     circlesGroup = chartGroup.append('g')
         .selectAll('circle')
         .data(censusData)
         .enter()
         .append('circle')
         .attr('cx', d => xLinearScale(d[chosenXAxis]))
         .attr('cy', d => yLinearScale(d[chosenYAxis]))
         .attr('r', 14)
         .attr('fill', 'dark')
         .attr('opacity', '.7');

     // append state abbreviation within circles 
     textCircles = chartGroup.append('g')
         .selectAll('text')
         .data(censusData)
         .enter()
         .append('text')
         .text(d => d.abbr)
         .attr('x', d => xLinearScale(d[chosenXAxis]))
         .attr('y', d => yLinearScale(d[chosenYAxis]) + 4)
         .attr('font-size', '10')
         .attr('fill', 'white')
         .attr('font-weight', 'bold')
         .attr('text-anchor', 'middle');

     // Create group for x-axis labels
     xLabelsGroup = chartGroup.append('g')
         .attr('transform', `translate(${width / 2}, ${height + 20})`);

     smokesLabel = xLabelsGroup.append('text')
         .attr('x', 0)
         .attr('y', 20)
         .attr('value', 'smokes')
         .classed('active', true)
         .text('Smokers (%)');

     healthcareLabel = xLabelsGroup.append('text')
         .attr('x', 0)
         .attr('y', 40)
         .attr('value', 'healthcare')
         .classed('inactive', true)
         .text('Lacks Healthcare (%)');

     obesityLabel = xLabelsGroup.append('text')
         .attr('x', 0)
         .attr('y', 60)
         .attr('value', 'obesity')
         .classed('inactive', true)
         .text('Obese (%)');

     // Create group for three y-axis labels
     yLabelsGroup = chartGroup.append('g')
         .attr('transform', 'rotate(-90)');

     ageLabel = yLabelsGroup.append('text')
         .attr('y', 0 - margin.left + 15)
         .attr('x', 0 - (height / 2))
         .attr('value', 'age')
         .classed('active', true)
         .text('Median Age');

     incomeLabel = yLabelsGroup.append('text')
         .attr('y', 0 - margin.left + 35)
         .attr('x', 0 - (height / 2))
         .attr('value', 'income')
         .classed('inactive', true)
         .text('Median Income');

     povertyLabel = yLabelsGroup.append('text')
         .attr('y', 0 - margin.left + 55)
         .attr('x', 0 - (height / 2))
         .attr('value', 'poverty')
         .classed('inactive', true)
         .text('In Poverty (%)');

     // updateToolTip function above csv import
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     // x-axis labels event listener
     xLabelsGroup.selectAll('text')
         .on('click', function() {
             // get value of selection
             xValue = d3.select(this).attr('value');
             if (xValue !== chosenXAxis) {
                 // replaces chosenXAxis with value
                 chosenXAxis = xValue;

                 // functions here found above csv import
                 // updates x-scale for new data
                 xLinearScale = xScale(censusData, chosenXAxis);

                 // updates x-axis with transition
                 xAxis = xRenderAxes(xLinearScale, xAxis);

                 // updates circles and circle text with new x-values
                 circlesGroup = xRenderCircles(circlesGroup, xLinearScale, chosenXAxis);
                 textCircles = renderXCircleText(textCircles, xLinearScale, chosenXAxis);

                 // updates tooltips with new info
                 circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                 // changes classes to change bold text
                 if (chosenXAxis === 'obesity') {
                     obesityLabel
                         .classed('active', true)
                         .classed('inactive', false);
                     smokesLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     healthcareLabel
                         .classed('active', false)
                         .classed('inactive', true);
                 } else if (chosenXAxis === 'healthcare') {
                     obesityLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     smokesLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     healthcareLabel
                         .classed('active', true)
                         .classed('inactive', false);
                 } else {
                     obesityLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     smokesLabel
                         .classed('active', true)
                         .classed('inactive', false);
                     healthcareLabel
                         .classed('active', false)
                         .classed('inactive', true);
                 }
             }
         });

     // y-axis labels event listener
     yLabelsGroup.selectAll('text')
         .on('click', function() {
             // get value of selection
             yValue = d3.select(this).attr('value');
             if (yValue !== chosenYAxis) {

                 // replaces chosenYAxis with value
                 chosenYAxis = yValue;

                 // functions here found above csv import
                 // updates y-scale for new data
                 yLinearScale = yScale(censusData, chosenYAxis);

                 // updates y-axis with transition
                 yAxis = yRenderAxes(yLinearScale, yAxis);

                 // updates circles and circle text with new y-values
                 circlesGroup = yRenderCircles(circlesGroup, yLinearScale, chosenYAxis);
                 textCircles = renderYCircleText(textCircles, yLinearScale, chosenYAxis);

                 // updates tooltips with new info
                 circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                 // changes classes to change bold text
                 if (chosenYAxis === 'income') {
                     incomeLabel
                         .classed('active', true)
                         .classed('inactive', false);
                     ageLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     povertyLabel
                         .classed('active', false)
                         .classed('inactive', true);
                 } else if (chosenYAxis === 'poverty') {
                     incomeLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     ageLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     povertyLabel
                         .classed('active', true)
                         .classed('inactive', false);
                 } else {
                     incomeLabel
                         .classed('active', false)
                         .classed('inactive', true);
                     ageLabel
                         .classed('active', true)
                         .classed('inactive', false);
                     povertyLabel
                         .classed('active', false)
                         .classed('inactive', true);
                 }
             }
         });
 });