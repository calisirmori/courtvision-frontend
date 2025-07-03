import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
import { setCrosshair, clearCrosshair } from "../../features/shotChart/crosshairSlice";

// Config constants
const WIDTH = 500;
const HEIGHT = 200;
const BIN_SIZE = 1; // 1ft binning
const MAX_DISTANCE = 30; // Max distance on x-axis

const ShotDistanceLineChart = ({ shots = [] }) => {
    const crosshair = useSelector((state) => state.crosshair);
    const dispatch = useDispatch();
    const svgRef = useRef();
    const overlayRef = useRef();

    useEffect(() => {
        if (!shots.length) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove(); // Clear chart if nothing to show
            return;
        }

        // Bin shots into distance intervals
        const bins = d3
            .bin()
            .value((d) => d.shotDistance)
            .domain([0, MAX_DISTANCE])
            .thresholds(d3.range(0, MAX_DISTANCE + BIN_SIZE, BIN_SIZE))(shots);

        const totalShots = d3.sum(bins, (b) => b.length);
        const data = bins.map((bin) => ({
            distance: bin.x0,
            frequency: (bin.length / totalShots) * 100, // Percent of total
        }));

        // SVG setup
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = WIDTH - margin.left - margin.right;
        const innerHeight = HEIGHT - margin.top - margin.bottom;

        // Scales
        const x = d3.scaleLinear().domain([0, MAX_DISTANCE]).range([0, innerWidth]);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.frequency) || 1])
            .nice()
            .range([innerHeight, 0]);

        // Main group element
        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Y Axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`));

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(MAX_DISTANCE / 5).tickFormat((d) => `${d}ft`));

        // Line path
        const line = d3
            .line()
            .x((d) => x(d.distance))
            .y((d) => y(d.frequency))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#dc2626")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Overlay setup
        const overlay = g.append("g").attr("class", "hover-overlay").style("display", "none");
        overlayRef.current = overlay;

        overlay.append("line")
            .attr("class", "hover-line")
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "4 2");

        overlay.append("circle")
            .attr("class", "hover-dot")
            .attr("r", 4)
            .attr("fill", "#dc2626")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5);

        const tooltip = overlay.append("g").attr("class", "hover-tooltip");
        tooltip.append("text")
            .attr("class", "hover-distance")
            .attr("fill", "#111")
            .attr("font-size", 12)
            .attr("font-weight", "bold");

        tooltip.append("text")
            .attr("class", "hover-player")
            .attr("y", 15)
            .attr("fill", "#dc2626")
            .attr("font-size", 12);

        tooltip.append("text")
            .attr("class", "hover-league")
            .attr("y", 30)
            .attr("fill", "#0ea5e9")
            .attr("font-size", 12);

        tooltip.append("text")
            .attr("class", "hover-guards")
            .attr("y", 45)
            .attr("fill", "#06b6d4")
            .attr("font-size", 12);

        // Interaction rect
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

        // Draw synced overlay if crosshair exists
        if (crosshair.distance != null) {
            const closest = data.find((d) => d.distance === crosshair.distance);
            if (closest) {
                const xPos = x(closest.distance);
                const yPos = y(closest.frequency);

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
                overlay.select(".hover-player").text(`Player: ${closest.frequency.toFixed(1)}%`);
                overlay.select(".hover-league").text(`League: 2%`);
                overlay.select(".hover-guards").text(`Guards: 3%`);
            }
        } else {
            overlay.style("display", "none");
        }

        // Chart title
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", 15)
            .text("Shot Frequency % by Distance")
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

export default ShotDistanceLineChart;
