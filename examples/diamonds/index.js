d3.tsv('diamond-data.tsv', d => ({
    carat: Number(d.carat),
    price: Number(d.price)
})).then(data => {
    const xExtent = fc
        .extentLinear()
        .accessors([d => d.carat])
        // Add padding so point halves aren't cut off at ends of axis
        .pad([0.003, 0.1])
        ;
    const yExtent = fc
        .extentLinear()
        .accessors([d => d.price])
        // Add padding so point halves aren't cut off at ends of axis
        .pad([0.001, 0.1])
        ;

    const xScale = d3.scaleLog().domain(xExtent(data));
    const yScale = d3.scaleLog().domain(yExtent(data));

    const zoom = fc.zoom().on('zoom', render);

    const gridlines = fc.annotationSvgGridline();

    const symbols = [
        // d3.symbolCircle,
        // d3.symbolCross,
        // d3.symbolDiamond,
        d3.symbolSquare,
        // d3.symbolStar,
        // d3.symbolTriangle,
        // d3.symbolWye
    ];

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    // const color = d3.scaleOrdinal(d3.schemeRdBu);

    const pointSeries = fc
        .seriesWebglPoint()
        .crossValue(d => d.carat)
        .mainValue(d => d.price)
        // .size(d => {
            
        //     // console.log(Math.pow(Math.max(100, xScale(d.carat + 0.01) - xScale(d.carat)), 1));
        //     return 800;
        //     // return Math.pow(Math.max(100, xScale(d.carat + 0.01) - xScale(d.carat)), 1);
        // }
        // )
        // .type(d => {
        //     return d3.symbolSquare;
        // })
        .size((_, i) => 30 + 100 * (i % 10))
        // .type((_, i) => symbols[i % symbols.length])
        // .type(d3.symbolTriangle)
        .type(d3.symbolSquare)
        // .type(d3.symbolCircle)
        .defined(() => true)
        .equals(d => d.length)
        .decorate( (program, data) => {
            // Set the color of the shapes
            // fc.webglFillColor([60 / 255, 180 / 255, 240 / 255, 1.0])(program);
            // fc.webglFillColor([20 / 255, 80 / 255, 24 / 255, 1.0])(program);

            fc.webglFillColor()
                .value((_, i) => {
                    const rgba = d3.color(color(i));
                    return [rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.opacity];
                })
                .data(data)(program);
            
            // Trying to add a stroke color. Doesn't render strokes because width is not set maybe???
            fc.webglStrokeColor([60 / 255, 180 / 255, 240 / 255, 1.0])(program);
            // fc.webglStrokeColor()
            //     .data(data)
            //     .value(d => 
            //          d.close > d.open ? 
            //              [0, 0, 1, 1] : [1, 0, 0, 1]
            //     );

            // program.fragmentShader().appendBody(`
            //     if (gl_PointCoord.y > 0.6 || gl_PointCoord.y < 0.4) {
            //         discard;
            //     }
            // `);


            const gl = program.context();
            // Setting up the clear color (i.e., background color)
            // gl.clearColor(0.5, 0.5, 0.5, 1.0);
            gl.clearColor(1.0, 1.0, 1.0, 0.0);
            // Clearing screen with clearColor set up just above
            gl.clear(gl.COLOR_BUFFER_BIT);

            // gl.enable(gl.BLEND);
            // gl.blendColor(0.3, 0.6, 0.9, 1.0);
            // gl.blendFuncSeparate(
            //     gl.DST_COLOR,
            //     gl.ZERO,
            //     gl.CONSTANT_ALPHA,
            //     gl.ZERO
            // );
        });
        

    const chart = fc
        .chartCartesian(xScale, yScale)
        .svgPlotArea(gridlines)
        .webglPlotArea(pointSeries)
        .yOrient('left')
        .xLabel('Carats →')
        .yLabel('↑ Price $')
        .xTickFormat(d3.format('.1f'))
        .yTickFormat(d3.format('.1s'))
        .decorate(selection => {
            selection
                .enter()
                .select('.webgl-plot-area')
                .raise()
                .call(zoom, xScale, yScale);
        });

    function render() {
        d3.select('#chart')
            .datum(data)
            .call(chart);
    }

    render();
});
