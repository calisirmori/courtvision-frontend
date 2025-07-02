import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
import { setCrosshair, clearCrosshair } from "../../features/shotChart/crosshairSlice";

const WIDTH = 500;
const HEIGHT = 200;
const BIN_SIZE = 1;
const MAX_DISTANCE = 30;

const ShotFGPercentageLineChart = ({ shots = [] }) => {
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
      const made = bin.filter((d) => d.shotMadeFlag).length;
      const attempts = bin.length;
      return {
        distance: bin.x0,
        fgPct: attempts > 0 ? (made / attempts) * 100 : 0,
      };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = WIDTH - margin.left - margin.right;
    const innerHeight = HEIGHT - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, MAX_DISTANCE]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`));
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(MAX_DISTANCE / 5).tickFormat((d) => `${d}ft`));

    const line = d3
      .line()
      .x((d) => x(d.distance))
      .y((d) => y(d.fgPct))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#dc2626")
      .attr("stroke-width", 2)
      .attr("d", line);

    const overlay = g.append("g").attr("class", "hover-overlay").style("display", "none");
    overlayRef.current = overlay;

    overlay.append("line").attr("class", "hover-line").attr("stroke", "gray").attr("stroke-dasharray", "4 2");

    overlay.append("circle")
      .attr("class", "hover-dot")
      .attr("r", 4)
      .attr("fill", "#dc2626")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5);

    const tooltip = overlay.append("g").attr("class", "hover-tooltip");
    tooltip.append("text").attr("class", "hover-distance").attr("fill", "#111").attr("font-size", 12).attr("font-weight", "bold");
    tooltip.append("text").attr("class", "hover-player").attr("y", 15).attr("fill", "#dc2626").attr("font-size", 12);
    tooltip.append("text").attr("class", "hover-league").attr("y", 30).attr("fill", "#0ea5e9").attr("font-size", 12);
    tooltip.append("text").attr("class", "hover-guards").attr("y", 45).attr("fill", "#06b6d4").attr("font-size", 12);

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const hovered = x.invert(mouseX);
        const binned = Math.round(hovered / BIN_SIZE) * BIN_SIZE;
        dispatch(setCrosshair({ distance: binned, x: mouseX }));
      })
      .on("mouseleave", () => {
        dispatch(clearCrosshair());
      });

    if (crosshair.distance != null) {
      const closest = data.find((d) => d.distance === crosshair.distance);
      if (closest) {
        const xPos = x(closest.distance);
        const yPos = y(closest.fgPct);

        overlay.style("display", null);
        overlay.select(".hover-line")
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", innerHeight);

        overlay.select(".hover-dot")
          .attr("cx", xPos)
          .attr("cy", yPos);

        overlay.select(".hover-tooltip")
          .attr("transform", `translate(${xPos + 8}, 0)`);

        overlay.select(".hover-distance").text(`Distance: ${closest.distance}ft`);
        overlay.select(".hover-player").text(`Player: ${closest.fgPct.toFixed(1)}%`);
        overlay.select(".hover-league").text(`League: 44%`);
        overlay.select(".hover-guards").text(`Guards: 42%`);
      }
    } else {
      overlay.style("display", "none");
    }

    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 15)
      .text("Field Goal % by Distance")
      .attr("class", "text-sm font-semibold");
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

export default ShotFGPercentageLineChart;
