import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCrosshair, clearCrosshair } from "../../features/shotChart/crosshairSlice";
import * as d3 from "d3";

const width = 500;
const height = 470;

const ShotCourt = ({ shots = [] }) => {
  const svgRef = useRef();
  const dispatch = useDispatch();
  const crosshair = useSelector((state) => state.crosshair);

  const xScale = d3.scaleLinear().domain([-250, 250]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 470]).range([height, 0]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Court background
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", "#f9fafb");

    svg.append("circle").attr("cx", xScale(0)).attr("cy", yScale(40)).attr("r", 7).attr("stroke", "black").attr("fill", "none");
    svg.append("line").attr("x1", xScale(-30)).attr("x2", xScale(30)).attr("y1", yScale(40)).attr("y2", yScale(40)).attr("stroke", "black");

    svg.append("path")
      .attr("d", d3.arc().innerRadius(xScale(0) - xScale(60)).outerRadius(xScale(0) - xScale(60)).startAngle(Math.PI).endAngle(2 * Math.PI)())
      .attr("transform", `translate(${xScale(0)}, ${yScale(190)})`)
      .attr("stroke", "black")
      .attr("fill", "none");

    svg.append("rect")
      .attr("x", xScale(-80))
      .attr("y", yScale(190))
      .attr("width", xScale(80) - xScale(-80))
      .attr("height", yScale(40) - yScale(190))
      .attr("stroke", "black")
      .attr("fill", "none");

    svg.append("path")
      .attr("d", d3.arc().innerRadius(xScale(0) - xScale(237.5)).outerRadius(xScale(0) - xScale(237.5)).startAngle(Math.PI * 0.1).endAngle(Math.PI * 0.9)())
      .attr("transform", `translate(${xScale(0)}, ${yScale(40)})`)
      .attr("stroke", "black")
      .attr("fill", "none");

    svg.append("line").attr("x1", xScale(-220)).attr("x2", xScale(-220)).attr("y1", yScale(40)).attr("y2", yScale(190)).attr("stroke", "black");
    svg.append("line").attr("x1", xScale(220)).attr("x2", xScale(220)).attr("y1", yScale(40)).attr("y2", yScale(190)).attr("stroke", "black");

    // Plot shots
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

    // Crosshair radius circle
    if (crosshair.distance != null) {
      const feetToPixels = (xScale(237.5) - xScale(0)) / 237.5;
      const radius = crosshair.distance * 9.2;

      svg.append("circle")
        .attr("cx", xScale(0))
        .attr("cy", yScale(40))
        .attr("r", radius)
        .attr("stroke", "#2563eb")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-dasharray", "4 2");
    }
    svg.append("text")
      .attr("x", xScale(230))
      .attr("y", yScale(40))
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text("~23ft arc");

    // Mouse interaction layer
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const xVal = xScale.invert(mouseX);
        const yVal = yScale.invert(mouseY);
        const basketX = xScale(0);
        const basketY = yScale(40);
        const dx = mouseX - basketX;
        const dy = mouseY - basketY;
        const pixelDist = Math.sqrt(dx * dx + dy * dy);
        const dist = Math.round(pixelDist / 9.2);
        dispatch(setCrosshair({ distance: dist, x: mouseX, y: mouseY }));
      })
      .on("mouseleave", () => {
        dispatch(clearCrosshair());
      });

  }, [shots, crosshair, dispatch]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="mx-auto bg-white border shadow-md"
    />
  );
};

export default ShotCourt;
