import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
import { setCrosshair, clearCrosshair } from "../../features/shotChart/crosshairSlice";

const WIDTH = 500;
const HEIGHT = 200;
const BIN_SIZE = 1;
const MAX_DISTANCE = 30;

const ShotSideBarChart = ({ shots = [] }) => {
  const crosshair = useSelector((state) => state.crosshair);
  const dispatch = useDispatch();
  const svgRef = useRef();
  const overlayRef = useRef();

  useEffect(() => {
    if (!shots.length) return;

    const bins = d3
      .bin()
      .value((d) => d.shotDistance)
      .domain([0, MAX_DISTANCE])
      .thresholds(d3.range(0, MAX_DISTANCE + BIN_SIZE, BIN_SIZE))(shots);

    const data = bins.map((bin) => {
      const left = bin.filter((d) => d.locX < 0).length;
      const right = bin.filter((d) => d.locX > 0).length;
      return {
        distance: bin.x0,
        left,
        right,
        diff: right - left
      };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = WIDTH - margin.left - margin.right;
    const innerHeight = HEIGHT - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([-d3.max(data, d => Math.max(d.left, d.right)) || 10, d3.max(data, d => Math.max(d.left, d.right)) || 10])
      .range([0, innerWidth]);

    const y = d3.scaleLinear().domain([0, MAX_DISTANCE]).range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5));
    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}ft`));

    // Bars - left
    g.selectAll(".bar-left")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", d => `bar-left bar-${d.distance}`)
      .attr("x", d => x(-d.left))
      .attr("y", d => y(d.distance + BIN_SIZE))
      .attr("width", d => x(0) - x(-d.left))
      .attr("height", y(0) - y(BIN_SIZE))
      .attr("fill", d => d.distance === crosshair.distance ? "#4cc578" : "#bae9cb")

    // Bars - right
    g.selectAll(".bar-right")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", d => `bar-right bar-${d.distance}`)
      .attr("x", x(0))
      .attr("y", d => y(d.distance + BIN_SIZE))
      .attr("width", d => x(d.right) - x(0))
      .attr("height", y(0) - y(BIN_SIZE))
      .attr("fill", d => d.distance === crosshair.distance ? "#c699f3" : "#e9d5ff")

    // Gradient definition for difference line
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", x(-100)) // cover the full range of diff
      .attr("y1", 0)
      .attr("x2", x(100))
      .attr("y2", 0);

    gradient.selectAll("stop")
      .data([
        { offset: "0%", color: "#22c55e" },
        { offset: "50%", color: "#22c55e" },
        { offset: "50%", color: "#a855f7" },
        { offset: "100%", color: "#a855f7" }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Difference line with gradient stroke
    const line = d3.line()
      .x(d => x(d.diff))
      .y(d => y(d.distance + BIN_SIZE / 2))
      .curve(d3.curveMonotoneY);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 2)
      .attr("d", line);


    // Center axis line
    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "2 2");

    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", y(23.75))
      .attr("y2", y(23.75))
      .attr("stroke", "#999")
      .attr("stroke-dasharray", "4 6")
      .attr("stroke-opacity", 0.4);

    g.append("text")
      .attr("x", 18)
      .attr("y", y(23.75) - 4)
      .attr("text-anchor", "end")
      .attr("font-size", 10)
      .attr("fill", "#666")
      .attr("opacity", 0.8)
      .text("3pt");


    // Hover interaction
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const hoveredDistance = Math.floor(y.invert(mouseY));
        dispatch(setCrosshair({ distance: hoveredDistance }));
      })
      .on("mouseleave", () => {
        dispatch(clearCrosshair());
      });

    // Crosshair line
    if (crosshair.distance != null) {
      const yPos = y(crosshair.distance + BIN_SIZE / 2);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yPos)
        .attr("y2", yPos)
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 2");
    }

    if (crosshair.distance != null) {
      const hovered = data.find(d => d.distance === crosshair.distance);
      if (hovered) {
        const xPos = x(hovered.diff);
        const yPos = y(hovered.distance + BIN_SIZE / 2);

        g.append("circle")
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("r", 3)
          .attr("fill", "#927e7e")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5);
      }
    }


    // Tooltip group next to crosshair line
    const hovered = data.find(d => d.distance === crosshair.distance);
    if (hovered) {
      const yPos = y(crosshair.distance + BIN_SIZE / 2);
      const tooltip = g.append("g")
        .attr("transform", `translate(${-margin.left + 50},${yPos - 30})`);

      tooltip.append("rect")
        .attr("x", -5)
        .attr("y", -14)
        .attr("width", 120) // adjust as needed
        .attr("height", 62) // enough for 4 lines
        .attr("rx", 3)
        .attr("fill", "white")
        .attr("opacity", 0.9);

      tooltip.append("text")
        .text(`Distance: ${hovered.distance}ft`)
        .attr("fill", "#111")
        .attr("font-size", 11)
        .attr("font-weight", "bold");

      tooltip.append("text")
        .text(`Left: ${hovered.left}`)
        .attr("fill", "green")
        .attr("font-size", 11)
        .attr("y", 14);

      tooltip.append("text")
        .text(`Right: ${hovered.right}`)
        .attr("fill", "purple")
        .attr("font-size", 11)
        .attr("y", 28);

      const diff = hovered.right - hovered.left;
      const sign = diff > 0 ? "+" : diff < 0 ? "" : "";
      const side = diff > 0 ? "Right" : diff < 0 ? "Left" : "";
      const color = diff > 0 ? "purple" : diff < 0 ? "green" : "#444";

      tooltip.append("text")
        .text(`Difference: ${sign}${Math.abs(diff)} ${side}`)
        .attr("fill", color)
        .attr("font-size", 11)
        .attr("y", 42);
    }

  }, [shots, crosshair, dispatch]);



  return (
    <svg
      ref={svgRef}
      width={WIDTH}
      height={HEIGHT}
      className="mx-auto bg-white border shadow-sm"
    />
  );
};

export default ShotSideBarChart;
