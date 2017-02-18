import * as d3 from 'd3';
import * as topojson from 'topojson';

import _ from 'lodash';
import './style/style.sass';

        //page title
d3.select("body")
    .append("div")
    .append('text')
    .attr("class", "tooltip")
    .attr("position", "center")
    .style("visibility", "visible")
    .style("z-index", "10")
    .attr('id', 'title')
    .text('Meteorite Strikes Around the World');

let tooltip = d3.select("body")
    .append("div")
    .attr("class" , "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("no data");

let meteorDataUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
let topojsonWorldMapUrl = "https://res.cloudinary.com/dtau8d3ak/raw/upload/v1487235741/topocountries_p1vtv8.json";

let transform = {k: 1, x: 0, y: 0};

let width = 800,
    height = 500;

let projection = d3.geoMercator()
    .center([0, 5])
    .scale(125)
    //[yaw, pitch , roll]
    .rotate([0, 0]);

let svg = d3.select("body").append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height);

let path = d3.geoPath()
    .projection(projection);

let g = svg.append("g");

d3.json(topojsonWorldMapUrl, function(error, worldMap) {

    d3.json(meteorDataUrl, function (error, meteorMap) {

                //horizontal and vertical center
        let hCenter = width/2;
        let vCenter = height/2;

                //sort from largest to smallest and place on map in that order
                //so smaller meteors are not buried and inaccessible beneath larger ones
        let sortedMeteors = meteorMap.features.sort((a, b) => b.properties.mass - a.properties.mass);

                //scale size of meteor circles
        var scale = d3.scalePow().exponent(0.5)
            .domain(d3.extent(sortedMeteors, function (d) {
                return d.properties.mass / Math.PI;
            }))
            .range([1, 20]);

                //draw map
        g.selectAll("path")
            .data(topojson.feature(worldMap, worldMap.objects.countries)
                .features)
            .enter()
            .append("path")
                .attr("class", "countries")
                .attr("transform", "translate(-80, 0)")
                .attr("fill", "green")
                .attr("d", path);

                //draw meteor strike circles
        g.selectAll('circle')
            .data(sortedMeteors)
            .enter()
            .append('circle')
                .attr('cx', function (d) {
                    return projection([+d.properties.reclong, +d.properties.reclat])[0];
                })
                .attr('cy', function (d) {
                    return projection([+d.properties.reclong, +d.properties.reclat])[1];
                })
                .attr('r', function (d) {
                    return scale(+d.properties.mass);
                })
                .attr("transform", "translate(-80, 0)")
                .style("fill", function(d) {
                    let maxMass = 110000;
                    let mass = d.properties.mass;
                    mass = mass > maxMass ? maxMass: mass;
                    let green = 255 - Math.ceil(mass * 255/(maxMass + 0.01));
                    let red = 255;
                    let blue = 0;
                    let opacity = 0.7;

                    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                })
                .attr('d', path.pointRadius(function (d) {
                        return scale(d.properties.mass);
                }))
                .on("mouseover", function(d){
                    let year = new Date(d.properties.year).getFullYear();
                    let nameYear = d.properties.name + ' ,' + year;
                    let mass = d.properties.mass + ' kg';
                    let latitude = d.geometry.coordinates[1].toFixed(4);
                    let longitude = d.geometry.coordinates[0].toFixed(4);
                    d3.select(this).attr("class", "strikeSelected");
                    tooltip.style("visibility", "visible")
                        .style("top", (d3.event.pageY) + "px")
                        .style("left", (d3.event.pageX) + "px")
                        .html(`${year}<br/>
                            Name: ${d.properties.name}<br/>
                            Mass: ${d.properties.mass/1000} Tonnes (X1000kg)<br/>
                            Lat: ${latitude}  Long: ${longitude}<br/>`);
                })
                    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                    .on("mouseout", function(){
                        d3.select(this)
                            .attr("class", function(d) {return d.Doped;});
                        tooltip.style("visibility", "hidden");
                    })
    });
});

svg.call(
    d3.zoom()
        .on("zoom", function() {
            g.attr("transform", d3.event.transform);
            transform = d3.event.transform;

                    //limit zoom out to default scale
            if (transform.k < 1) {
                transform.k = 1;
                transform.x = 0;
                transform.y = 0;
            }
        })
)

