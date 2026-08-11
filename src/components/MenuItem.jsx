import React from "react";

export default function MenuItem({

    icon,

    texto

}) {

    return (

        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-stone-800 transition">

            <span className="text-xl">

                {icon}

            </span>

            <span className="font-medium">

                {texto}

            </span>

        </button>

    );

}