import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
import * as d3Hexbin from "d3-hexbin";

const width = 540;
const height = 570;

const ShotCourt = ({ shots = [] }) => {
  const svgRef = useRef();
  const crosshair = useSelector((state) => state.crosshair);
  const [showDetailed, setShowDetailed] = useState(true);

  const xScale = d3.scaleLinear()
    .domain([-250, 250]) // NBA half-court width in feet (centered)
    .range([20, 520]);   // offset by 20 to match SVG viewBox left margin

  const yScale = d3.scaleLinear()
    .domain([-50, 420])  // NBA half-court depth (basket at y=0)
    .range([55, 520]);


  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Main court group with proper offset to match NBA SVG
    const courtGroup = svg.append("g")
      .attr("class", "court")
      .attr("transform", "translate(20, 50)");

    // Background rectangle
    courtGroup.append("rect")
      .attr("fill", "#f3f7fd")
      .attr("x", -20)
      .attr("y", -20)
      .attr("width", 540)
      .attr("height", 510);

    // Markings group
    const markings = courtGroup.append("g").attr("class", "markings");

    const courtPath = (d) =>
      markings.append("path")
        .attr("fill", "none")
        .attr("stroke", "#1d428a")
        .attr("stroke-width", 2.6)
        .attr("style", "stroke-linecap:round")
        .attr("d", d);

    // All lines copied from NBA SVG
    courtPath("M470,0v140");
    courtPath("M30,0v140");
    courtPath("M330,0v190");
    courtPath("M170,0v190");
    courtPath("M310,0v190");
    courtPath("M190,0v190");
    courtPath("M330,190H170");
    courtPath("M280,40h-60");
    courtPath("M250,40v2.5");
    courtPath("M290,40v10");
    courtPath("M210,40v10");
    courtPath("M250,42.5c4.1,0,7.5,3.4,7.5,7.5s-3.4,7.5-7.5,7.5s-7.5-3.4-7.5-7.5S245.9,42.5,250,42.5z");
    courtPath("M0,0v470h190c0-33.1,26.9-60,60-60s60,26.9,60,60h190V0H0z");
    courtPath("M250,410c-33.1,0-60,26.9-60,60h40c0-11,9-20,20-20s20,9,20,20h40C310,436.9,283.1,410,250,410z");
    courtPath("M250,450c-11,0-20,9-20,20h40C270,459,261,450,250,450z");
    courtPath("M310,190c0,33.1-26.9,60-60,60s-60-26.9-60-60c0,33.1,26.9,60,60,60S310,223.1,310,190z");

    // Dashed arc
    markings.append("path")
      .attr("fill", "none")
      .attr("stroke", "#1d428a")
      .attr("stroke-width", 2.6)
      .attr("style", "stroke-dasharray:5,10")
      .attr("d", "M310,190c0-33.1-26.9-60-60-60s-60,26.9-60,60c0-33.1,26.9-60,60-60S310,156.9,310,190z");

    courtPath("M290,50c0,22.1-17.9,40-40,40s-40-17.9-40-40c0,22.1,17.9,40,40,40S290,72.1,290,50z");
    courtPath("M469.8,139.9c-49.7,121.4-188.3,179.6-309.7,129.9c-59-24.1-105.8-70.9-129.9-129.9 c49.7,121.4,188.3,179.6,309.7,129.9C398.9,245.7,445.7,198.9,469.8,139.9z");
    courtPath("M140,0v5");
    courtPath("M359.9,0v5");
    courtPath("M470,281.6h30");
    courtPath("M0,286.7h30");
    courtPath("M170,69.8h-10");
    courtPath("M170,79.9h-10");
    courtPath("M170,109.9h-10");
    courtPath("M170,140h-10");
    courtPath("M340,69.8h-10");
    courtPath("M340,79.9h-10");
    courtPath("M340,109.9h-10");
    courtPath("M0,140h30");
    courtPath("M470,139.9h30");


    if (showDetailed) {
      svg.selectAll(".shot")
        .data(shots)
        .enter()
        .append("circle")
        .attr("class", "shot")
        .attr("cx", (d) => xScale(d.locX))
        .attr("cy", (d) => yScale(d.locY))
        .attr("r", 3)
        .attr("fill", (d) => (d.shotMadeFlag ? "#16a34a" : "#dc2626"))
        .attr("opacity", 0.8);
    } else {
      const hexbin = d3Hexbin.hexbin()
        .x((d) => xScale(d.locX))
        .y((d) => yScale(d.locY))
        .radius(5)
        .extent([[0, 0], [width, height]]);
      const maxBinCount = d3.max(shots, s => s.length);
      const bins = hexbin(shots);
      svg.selectAll(".hex")
        .data(bins)
        .enter().append("path")
        .attr("class", "hex")
        .attr("d", d => {
          const count = d.length;
          const maxR = 7;
          const minR = 2.5;

          // Use a square root scale to flatten high values
          const scale = d3.scaleSqrt()
            .domain([1, d3.max(bins, b => b.length)])
            .range([minR, maxR]);

          return hexbin.hexagon(scale(count));
        })
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill", d => {
          const makes = d.filter(s => s.shotMadeFlag).length;
          const pct = makes / d.length;
          return d3.interpolateRdYlBu(1 - pct);
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .on("mouseenter", (event, d) => {
          const makes = d.filter(s => s.shotMadeFlag).length;
          const pct = ((makes / d.length) * 100).toFixed(1);
          const radius = Math.round(Math.sqrt((d[0].locX) ** 2 + (d[0].locY) ** 2) / 10) ;
          const tooltip = svg.append("g").attr("class", "hex-tooltip").attr("transform", `translate(${d.x + 10},${d.y - 30})`);

          tooltip.append("rect")
            .attr("width", 110)
            .attr("height", 50)
            .attr("fill", "#fff")
            .attr("stroke", "#999")
            .attr("rx", 4);

          tooltip.append("text").attr("x", 6).attr("y", 16).attr("font-size", 11).text(`${d.length} shots`);
          tooltip.append("text").attr("x", 6).attr("y", 30).attr("font-size", 11).text(`${pct}% FG (~${radius}ft)`);
        })
        .on("mouseleave", () => svg.selectAll(".hex-tooltip").remove());
    }

    // Optional: add crosshair radius if set elsewhere
    if (crosshair.distance != null) {
      const feetToPixels = xScale(237.5) - xScale(0);
      svg.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", yScale(0))
        .attr("r", feetToPixels * (crosshair.distance / 23.75))
        .attr("stroke", "#646464")
        .attr("stroke-width", 10)
        .attr("fill", "none")
        .attr("opacity", "0.7");
    }

  }, [shots, showDetailed, crosshair]);

  return (
    <div className="relative w-fit">
      <button
        className="absolute right-0 top-0 m-2 px-2 py-1 text-sm border rounded bg-white shadow"
        onClick={() => setShowDetailed((v) => !v)}
      >
        {showDetailed ? "Summary View" : "Detailed View"}
      </button>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="mx-auto bg-white border shadow-md"
      />
    </div>
  );
};

export default ShotCourt;
