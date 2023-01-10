const container = document.getElementById('container')

const generate_hex = (index) => {
    const hex = document.createElement('div')

    const top = document.createElement('div')
    const middle = document.createElement('div')
    const bottom = document.createElement('div')

    hex.classList.add('hex')
    top.classList.add('top')
    middle.classList.add('middle')
    bottom.classList.add('bottom')

    hex.appendChild(top)
    hex.appendChild(middle)
    hex.appendChild(bottom)

    if (index % 2 == 1) hex.classList.add('even')

    return hex
}

const generate_empty_hex = (index) => {
    const hex = document.createElement('div')

    hex.classList.add('hex')
    hex.classList.add('hex-invisible')

    return hex
}

const generate_grid = (rows, hexagons) => {
    container.innerHTML = ''

    const mappings = []

    const ignore = {
        0: [0, 1, hexagons - 1],
        1: [0, hexagons - 1],
        2: [0],
        3: [],
        4: [0],
        5: [0, hexagons - 1],
        6: [0, 1, hexagons - 1]
    }

    for (let row_index = 0; row_index < rows; row_index++) {
        const row = document.createElement('div')
        row.classList.add('hex-row')

        if (row_index % 2 == 1) row.classList.add('even')

        const row_mappings = []

        for (let hexagon_index = 0; hexagon_index < hexagons; hexagon_index++) {
            if (!(ignore[row_index].includes(hexagon_index))) {
                const hex = generate_hex(hexagon_index)
                
                row_mappings.push(hex)

                row.appendChild(hex)
            } else {
                row.appendChild(generate_empty_hex(hexagon_index))
            }
        }

        if (row_index % 2 == 1) {
            row_mappings.reverse()
        } 

        mappings.push(...row_mappings)
        
        container.appendChild(row)
    }

    for (const [id, element] of Object.entries(mappings)) {
        element.onclick = () => {
            console.log(id)
        }
    }

    window.grid = mappings
}