import React from "react";
import { teamInformationById } from "../../data/teamInformationById";

const PlayerHeader = ({ player }) => {
    console.log(player);

    const team = teamInformationById[player.teamId] || {
        abbreviation: "NBA",
        name: "National Basketball Association",
        primaryColor: "#002b5c",
        secondaryColor: "#ffb730",
    };

    function formatHeight(heightString) {
        if (!heightString || !heightString.includes("-")) return "--";

        const [feet, inches] = heightString.split("-").map(Number);
        const meters = ((feet * 12 + inches) * 0.0254).toFixed(2);

        return `${feet}'${inches}" (${meters}m)`;
    }

    function getAge(dateString) {
        if (!dateString) return "--";
        const birthDate = new Date(dateString);
        const now = new Date();

        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }

        return `${age} years`;
    }

    function formatWeight(weightString) {
        const pounds = Number(weightString);
        if (isNaN(pounds)) return "--";

        const kg = (pounds * 0.453592).toFixed(0); // round to nearest whole number
        return `${pounds}lb (${kg}kg)`;
    }

    function formatBirthDate(dateString) {
        if (!dateString) return "--";

        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    const teamColor = team.primaryColor || "#1a1a1a";
    const teamColorSecondary = team.secondaryColor || "#1a1a1a";

    return (
        <div style={{ backgroundColor: teamColor, fontFamily: "Oswald, sans-serif" }} className="text-white overflow-hidden">
            {/* Top Banner */}
            <div className="relative flex flex-col md:flex-row items-center justify-between px-6 max-w-[1440px] mx-auto">
                {/* Background Logo or Logo Icon */}
                <div className="absolute inset-0 opacity-5 flex items-center pointer-events-none">
                    <img
                        src={`https://cdn.nba.com/logos/nba/${player.teamId}/primary/L/logo.svg`}
                        alt={`${team.abbreviation}_logo_bg`}
                        className="w-full max-w-[500px] object-contain"
                    />
                </div>

                {/* Player Info and Logo */}
                <div className="relative z-10 flex items-center gap-6 px-10">
                    <img
                        className="max-md:h-[80px] max-md:w-[80px] md:h-[128px] md:w-[128px] object-contain absolute max-sm:left-5 max-sm:top-5 max-md:left-10 max-md:top-10 left-0 top-0"
                        src={`https://cdn.nba.com/logos/nba/${player.teamId}/primary/L/logo.svg`}
                        alt={`${team.abbreviation}_teamlogo`}
                    />

                    {/* Player picture */}
                    <img
                        src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.playerId}.png`}
                        alt={`${player.firstName}_photo`}
                        className="object-contain max-sm:w-1/2 max-sm:h-1/2 max-md:w-1/3 max-md:h-1/3 md:w-1/4 md:h-1/4 mt-20" />

                    {/* Name and Role */}
                    <div>
                        <p className="uppercase text- max-sm:text-xs text-sm tracking-wide">
                            {team.name} | #{player.jersey} | {player.position}
                        </p>
                        <h1 className="uppercase max-sm:text-xl max-md:text-3xl md:text-5xl font-extrabold leading-tight">
                            {player.firstName}
                            <br />
                            {player.lastName}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ backgroundColor: teamColorSecondary }} className="border-t border-white/90 text-center lg:px-10 z-50">
                <div className="grid lg:grid-cols-7 text-sm md:text-base font-medium max-w-[1440px] mx-auto">
                    <div className="max-lg:hidden p-4 border-x flex justify-center items-center">
                        <div>
                            <div className="tracking-wide font-sans -mb-1">PPG</div>
                            <div className="text-xl font-bold">{Number(player.pts).toFixed(1) ?? "--"}</div>
                        </div>
                    </div>
                    <div className="max-lg:hidden p-4 border-r flex justify-center items-center">
                        <div>
                            <div className="tracking-wide font-sans -mb-1">RPG</div>
                            <div className="text-xl font-bold">{Number(player.reb).toFixed(1) ?? "--"}</div>
                        </div>
                    </div>
                    <div className="max-lg:hidden p-4 border-r flex justify-center items-center">
                        <div>
                            <div className="tracking-wide font-sans -mb-1">APG</div>
                            <div className="text-xl font-bold">{Number(player.ast).toFixed(1) ?? "--"}</div>
                        </div>
                    </div>

                    {/* Hidden Element for compatabilitiy */}
                    <div className="lg:hidden flex justify-center items-center py-3 max-lg:border-b">
                        <div className="px-4 flex justify-center items-center">
                            <div>
                                <div className="tracking-wide font-sans -mb-1">PPG</div>
                                <div className="text-xl font-bold">{Number(player.pts).toFixed(1) ?? "--"}</div>
                            </div>
                        </div>
                        <div className="px-4 border-x flex justify-center items-center">
                            <div>
                                <div className="tracking-wide font-sans -mb-1">RPG</div>
                                <div className="text-xl font-bold">{Number(player.reb).toFixed(1) ?? "--"}</div>
                            </div>
                        </div>
                        <div className="px-4 flex justify-center items-center">
                            <div>
                                <div className="tracking-wide font-sans -mb-1">APG</div>
                                <div className="text-xl font-bold">{Number(player.ast).toFixed(1) ?? "--"}</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-rows-2 grid-cols-4 lg:col-span-4">
                        <div className="px-4 py-2 border-r border-b">
                            <div className="text-xs font-sans">HEIGHT</div>
                            <div className=" ">{formatHeight(player.height)}</div>
                        </div>
                        <div className="px-4 py-2 border-r border-b">
                            <div className="text-xs font-sans">WEIGHT</div>
                            <div className="">{formatWeight(player.weight)}</div>
                        </div>
                        <div className="px-4 py-2 border-r border-b">
                            <div className="text-xs font-sans">COUNTRY</div>
                            <div className=" ">{player.country}</div>
                        </div>
                        <div className="px-4 py-2 lg:border-r border-b">
                            <div className="text-xs font-sans">LAST ATTENDED</div>
                            <div className=" ">{player.school}</div>
                        </div>
                        <div className="px-4 py-2 border-r ">
                            <div className="text-xs font-sans">AGE</div>
                            <div className="">{getAge(player.birthDate)}</div>
                        </div>
                        <div className="px-4 py-2 border-r ">
                            <div className="text-xs font-sans">BIRTHDATE</div>
                            <div className="">{formatBirthDate(player.birthDate)}</div>
                        </div>
                        <div className="px-4 py-2 border-r ">
                            <div className="text-xs font-sans">DRAFT</div>
                            <div className="">{player.draftYear} R{player.draftRound} Pick {player.draftNumber}</div>
                        </div>
                        <div className="px-4 py-2 lg:border-r ">
                            <div className="text-xs font-sans">EXPERIENCE</div>
                            <div className="">{player.seasonExp} Years</div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default PlayerHeader;
