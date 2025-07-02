import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
import { setCrosshair, clearCrosshair } from "../../features/shotChart/crosshairSlice";

const WIDTH = 500;
const HEIGHT = 200;
const BIN_SIZE = 1;
const MAX_DISTANCE = 30;

const ShotSideFGPercentageBarChart = ({ shots = [] }) => {
  const crosshair = useSelector((state) => state.crosshair);
  const dispatch = useDispatch();
  const svgRef = useRef();

  useEffect(() => {
    if (!shots.length) return;

    const bins = d3
      .bin()
      .value((d) => d.shotDistance)
      .domain([0, MAX_DISTANCE])
      .thresholds(d3.range(0, MAX_DISTANCE + BIN_SIZE, BIN_SIZE))(shots);

    const data = bins.map((bin) => {
      const leftShots = bin.filter(d => d.locX < 0);
      const rightShots = bin.filter(d => d.locX > 0);
      const leftMade = leftShots.filter(d => d.shotMadeFlag).length;
      const rightMade = rightShots.filter(d => d.shotMadeFlag).length;
      const fgPctLeft = leftShots.length ? (leftMade / leftShots.length) * 100 : 0;
      const fgPctRight = rightShots.length ? (rightMade / rightShots.length) * 100 : 0;
      return {
        distance: bin.x0,
        fgPctLeft,
        fgPctRight,
        diff: fgPctRight - fgPctLeft
      };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = WIDTH - margin.left - margin.right;
    const innerHeight = HEIGHT - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([-100, 100])
      .range([0, innerWidth]);

    const y = d3.scaleLinear().domain([0, MAX_DISTANCE]).range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => `${Math.abs(d)}%`).ticks(5));

    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}ft`));

    g.selectAll(".bar-left")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(-d.fgPctLeft))
      .attr("y", d => y(d.distance + BIN_SIZE))
      .attr("width", d => x(0) - x(-d.fgPctLeft))
      .attr("height", y(0) - y(BIN_SIZE))
      .attr("fill", d => d.distance === crosshair.distance ? "#4cc578" : "#bae9cb");

    g.selectAll(".bar-right")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", d => y(d.distance + BIN_SIZE))
      .attr("width", d => x(d.fgPctRight) - x(0))
      .attr("height", y(0) - y(BIN_SIZE))
      .attr("fill", d => d.distance === crosshair.distance ? "#c699f3" : "#e9d5ff");

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", x(-100))
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

    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "2 2");

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [, mouseY] = d3.pointer(event);
        const hoveredDistance = Math.floor(y.invert(mouseY));
        dispatch(setCrosshair({ distance: hoveredDistance }));
      })
      .on("mouseleave", () => {
        dispatch(clearCrosshair());
      });

    const hovered = data.find(d => d.distance === crosshair.distance);
    if (hovered) {
      const yPos = y(crosshair.distance + BIN_SIZE / 2);
      const xPos = x(hovered.diff);

      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yPos)
        .attr("y2", yPos)
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 2");

      g.append("circle")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 3)
        .attr("fill", "#927e7e")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5);

      const tooltip = g.append("g")
        .attr("transform", `translate(${-margin.left + 50},${yPos - 30})`);

      tooltip.append("rect")
        .attr("x", -5)
        .attr("y", -14)
        .attr("width", 120)
        .attr("height", 62)
        .attr("rx", 3)
        .attr("fill", "white")
        .attr("opacity", 0.9);

      tooltip.append("text")
        .text(`Distance: ${hovered.distance}ft`)
        .attr("fill", "#111")
        .attr("font-size", 11)
        .attr("font-weight", "bold");

      tooltip.append("text")
        .text(`Left: ${hovered.fgPctLeft.toFixed(1)}%`)
        .attr("fill", "green")
        .attr("font-size", 11)
        .attr("y", 14);

      tooltip.append("text")
        .text(`Right: ${hovered.fgPctRight.toFixed(1)}%`)
        .attr("fill", "purple")
        .attr("font-size", 11)
        .attr("y", 28);

      const diff = hovered.diff;
      const sign = diff > 0 ? "+" : diff < 0 ? "" : "";
      const side = diff > 0 ? "Right" : diff < 0 ? "Left" : "";
      const color = diff > 0 ? "purple" : diff < 0 ? "green" : "#444";

      tooltip.append("text")
        .text(`Difference: ${sign}${Math.abs(diff).toFixed(1)}% ${side}`)
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

export default ShotSideFGPercentageBarChart;