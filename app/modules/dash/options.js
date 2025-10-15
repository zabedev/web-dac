
export
    const serverProtocols = [
        { label: 'Modbus TCP', value: "modbus-tcp" },
        { label: 'Modbus Serial', value: "modbus-serial" },
        { label: 'HTTP', value: "http" },
        // { label: 'RFID', value: "rfid" },
    ]

export
    const sourceTypes = [
        { label: 'Modbus TCP', value: "modbus-tcp" },
        { label: 'Modbus Serial', value: "modbus-serial" },
        { label: 'Http Request', value: "http" },
        // { label: 'RFID', value: "rfid" },
    ]

export
    const httpRequestMethod = [
        { label: 'GET', value: "get" },
        { label: 'POST', value: "post" },
        { label: 'PUT', value: "put" },
        { label: 'Delete', value: "delete" },
    ]

export
    const modbusFunctions = [
        { label: 'Read Coils (FC01)', value: "readCoils" },
        { label: 'Read Discrete Inputs (FC02)', value: "readDiscreteInputs" },
        { label: 'Read Holding Registers (FC03)', value: "readHoldingRegisters" },
        { label: 'Read Input Registers (FC04)', value: "readInputRegisters" },
        { label: 'Read Registers (Enron)', value: "readRegistersEnron" }
    ]
export
    const modbusFormatOptions = [
        { label: "Int16", value: "int16" },
        { label: "UInt16", value: "uint16" },
        { label: "Int32", value: "int32" },
        { label: "UInt32", value: "uint32" },
        { label: "Float32", value: "float32" },
        { label: "Float64", value: "float64" },
        { label: "String", value: "string" },
        { label: "Bits", value: "bits" },
    ];

export
    const modbusLimits = {
        readCoils: 2000,
        readDiscreteInputs: 2000,
        readHoldingRegisters: 125,
        readInputRegisters: 125,
        readRegistersEnron: 125,
    }

export
    const intervalLimits = {
        min: 1,
        max: 86400
    }

export
    const slaveLimits = {
        min: 1,
        max: 247
    }
export
    const addressLimits = {
        min: 0,
        max: 65535
    }


export
    const measurementUnits = [
        { label: 'Metro (m)', value: 'm' },
        { label: 'Quilômetro (km)', value: 'km' },
        { label: 'Centímetro (cm)', value: 'cm' },
        { label: 'Milímetro (mm)', value: 'mm' },
        { label: 'Micrômetro (µm)', value: 'µm' },
        { label: 'Nanômetro (nm)', value: 'nm' },
        { label: 'Polegada (in)', value: 'in' },
        { label: 'Pé (ft)', value: 'ft' },
        { label: 'Jarda (yd)', value: 'yd' },
        { label: 'Milha (mi)', value: 'mi' },
        { label: 'Milha Náutica (nmi)', value: 'nmi' },
        { label: 'Ano-luz (ly)', value: 'ly' },
        { label: 'Ponto tipográfico (pt)', value: 'pt' },
        { label: 'Pica (pc)', value: 'pc' },
        { label: 'Miligramas (mg)', value: 'mg' },
        { label: 'Gramas (g)', value: 'g' },
        { label: 'Quilogramas (kg)', value: 'kg' },
        { label: 'Tonelada (t)', value: 't' },
        { label: 'Libra (lb)', value: 'lb' },
        { label: 'Onça (oz)', value: 'oz' },
        { label: 'Stone (st)', value: 'st' },
        { label: 'Metro quadrado (m²)', value: 'm2' },
        { label: 'Quilômetro quadrado (km²)', value: 'km2' },
        { label: 'Centímetro quadrado (cm²)', value: 'cm2' },
        { label: 'Milímetro quadrado (mm²)', value: 'mm2' },
        { label: 'Hectare (ha)', value: 'ha' },
        { label: 'Acre (ac)', value: 'ac' },
        { label: 'Pé quadrado (ft²)', value: 'ft2' },
        { label: 'Polegada quadrada (in²)', value: 'in2' },
        { label: 'Jarda quadrada (yd²)', value: 'yd2' },
        { label: 'Metro cúbico (m³)', value: 'm3' },
        { label: 'Litro (L)', value: 'L' },
        { label: 'Mililitro (mL)', value: 'mL' },
        { label: 'Microlitro (µL)', value: 'µL' },
        { label: 'Xícara (cup)', value: 'cup' },
        { label: 'Colher de sopa (tbsp)', value: 'tbsp' },
        { label: 'Colher de chá (tsp)', value: 'tsp' },
        { label: 'Onça fluida (fl oz)', value: 'fl-oz' },
        { label: 'Pinta (pt)', value: 'pt' },
        { label: 'Quartilho (qt)', value: 'qt' },
        { label: 'Galão (gal)', value: 'gal' },
        { label: 'Bit (b)', value: 'b' },
        { label: 'Byte (B)', value: 'B' },
        { label: 'Kilobyte (kB)', value: 'kB' },
        { label: 'Megabyte (MB)', value: 'MB' },
        { label: 'Gigabyte (GB)', value: 'GB' },
        { label: 'Terabyte (TB)', value: 'TB' },
        { label: 'Petabyte (PB)', value: 'PB' },
        { label: 'Kibibyte (KiB)', value: 'KiB' },
        { label: 'Mebibyte (MiB)', value: 'MiB' },
        { label: 'Gibibyte (GiB)', value: 'GiB' },
        { label: 'Tebibyte (TiB)', value: 'TiB' },
        { label: 'Pebibyte (PiB)', value: 'PiB' },
        { label: 'Joule (J)', value: 'J' },
        { label: 'Watt-hora (Wh)', value: 'Wh' },
        { label: 'Quilowatt-hora (kWh)', value: 'kWh' },
        { label: 'Megawatt-hora (MWh)', value: 'MWh' },
        { label: 'Gigawatt-hora (GWh)', value: 'GWh' },
        { label: 'Milijoule (mJ)', value: 'mJ' },
        { label: 'Quilojoule (kJ)', value: 'kJ' },
        { label: 'Watt (W)', value: 'W' },
        { label: 'Quilowatt (kW)', value: 'kW' },
        { label: 'Megawatt (MW)', value: 'MW' },
        { label: 'Gigawatt (GW)', value: 'GW' },
        { label: 'Milowatt (mW)', value: 'mW' },
        { label: 'Microwatt (µW)', value: 'µW' },
        { label: 'Pascal (Pa)', value: 'Pa' },
        { label: 'Kilopascal (kPa)', value: 'kPa' },
        { label: 'Megapascal (MPa)', value: 'MPa' },
        { label: 'Bar', value: 'bar' },
        { label: 'Milibar (mbar)', value: 'mbar' },
        { label: 'PSI (lbf/in²)', value: 'psi' },
        { label: 'Torr', value: 'torr' },
        { label: 'Atmosfera (atm)', value: 'atm' },
        { label: 'Milímetro de mercúrio (mmHg)', value: 'mmHg' },
        { label: 'Celsius (°C)', value: 'C' },
        { label: 'Fahrenheit (°F)', value: 'F' },
        { label: 'Kelvin (K)', value: 'K' },
        { label: 'Rankine (R)', value: 'R' },
        { label: 'Milissegundo (ms)', value: 'ms' },
        { label: 'Segundo (s)', value: 's' },
        { label: 'Minuto (min)', value: 'min' },
        { label: 'Hora (h)', value: 'h' },
        { label: 'Dia (d)', value: 'd' },
        { label: 'Ano (y)', value: 'y' },
        { label: 'Newton (N)', value: 'N' },
        { label: 'Kilonewton (kN)', value: 'kN' },
        { label: 'Meganewton (MN)', value: 'MN' },
        { label: 'Libra-força (lbf)', value: 'lbf' },
        { label: 'Quilograma-força (kgf)', value: 'kgf' },
        { label: 'Tonelada-força (tf)', value: 'tf' },
        { label: 'Dyne', value: 'dyn' },
        { label: 'Radiano (rad)', value: 'rad' },
        { label: 'Grau (°)', value: 'deg' },
        { label: 'Gradian (grad)', value: 'grad' },
        { label: 'Minuto de arco (arcmin)', value: 'arcmin' },
        { label: 'Segundo de arco (arcsec)', value: 'arcsec' },
        { label: 'Volta completa (turn)', value: 'turn' },
    ];