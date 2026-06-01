import { FullDataObj, DigitsCountObj, ContainerObj, MappedId, LocationObj } from "./db-interface";

// this is a temporary holdover until I can figure out something that's less hard-coded
export const idLegend = {
    "locations": "location_id",
    "container_categories": "category_id",
    "storage_containers": "storage_id",
}

export const flippedLegend = {
    "location_id": "locations",
    "category_id": "container_categories",
    "storage_id": "storage_containers",
}

export const mapFilter = (mapped: Array<MappedId>, variable: string) => {
    return mapped?.filter((m: MappedId) => m.db === flippedLegend[`${variable}` as keyof typeof flippedLegend])?.[0]?.value;
}

export const padInput = (input: number | string, digit_count: number) => {
    return input.toString().padStart(digit_count, '0');
}

// export const flippedLegend = Object.fromEntries(
//   Object.entries(idLegend).map(([key, value]) => [value, key])
// );

const getDigitCountFromDB = (db: string, digitCount: Array<DigitsCountObj>) => {
    return digitCount.filter((d: DigitsCountObj) =>
        d.database_name === db
    )?.[0].digit_count;
}

export const parseRFID = (data: FullDataObj, input: string) => {
    const digitCounts = [...(data?.digitCounts ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order);
    
    let sliceStart = 0;
    let mapped: Array<MappedId> = digitCounts.map((d: DigitsCountObj) => {
        const value = input.slice(sliceStart, sliceStart + d.digit_count);
        sliceStart += d.digit_count;
        return {
            db: d.database_name,
            field: idLegend[d.database_name as keyof typeof idLegend],
            value,
        };
    }) ?? [];

    const returnObj = data?.containers.filter((c: ContainerObj) =>
        padInput(c.location_id, getDigitCountFromDB('locations', digitCounts)) == mapFilter(mapped, 'location_id') &&
        padInput(c.category_id, getDigitCountFromDB('container_categories', digitCounts)) == mapFilter(mapped, 'category_id') &&
        padInput(c.storage_id, getDigitCountFromDB('storage_containers', digitCounts)) == mapFilter(mapped, 'storage_id')
    )?.[0]

    return data?.containers.filter((c: ContainerObj) =>
        padInput(c.location_id, getDigitCountFromDB('locations', digitCounts)) == mapFilter(mapped, 'location_id') &&
        padInput(c.category_id, getDigitCountFromDB('container_categories', digitCounts)) == mapFilter(mapped, 'category_id') &&
        padInput(c.storage_id, getDigitCountFromDB('storage_containers', digitCounts)) == mapFilter(mapped, 'storage_id')
    )?.[0];
}

/** sort locations - move Unfixed to the end. this is the only override. */

export const sortUnfixed = (arr: Array<LocationObj>) => {
    let arrDup = [...arr];
    let unfixedLoc = arrDup.filter(x => x.location_name.toLowerCase() === 'unfixed')[0];

    let unfixedArr = arrDup.splice(arrDup.indexOf(unfixedLoc), 1);
    return [...arrDup, ...unfixedArr];
}

export const toRFID = (locId: number, catId: number, storId: number) => {
    return padInput(locId, 4) + padInput(catId, 3) + padInput(storId, 3);
}

export const capitalizeWords = (str: string) => {
  return str
    .toLowerCase() // Optional: ensures the rest of the word is lowercase
    .split(' ')    // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each
    .join(' ');    // Join them back into a single string
}

export const fixFieldType = (input: string | number | null, outputType: string) => {
    // check if number first.
    const inputAsNumber = Number(input);
    if (outputType === 'number' && typeof(inputAsNumber) === 'number' && !Number.isNaN(inputAsNumber)) {
        return inputAsNumber;
    }

    if (typeof(input) === 'string') {
        // return input.length ? input : null;
        return input;
    }

    return null;
}