// Ty to this beautiful person. Enums are horrible in ts
// https://blog.oyam.dev/typescript-enum-values/
type EnumObject = { [key: string]: number | string };
type EnumObjectEnum<E extends EnumObject> = E extends { [key: string]: infer ET | string } ? ET : never;
export function getEnumValues<E extends EnumObject>(enumObject: E): EnumObjectEnum<E>[] {
    return Object.keys(enumObject)
        .filter(key => Number.isNaN(Number(key)))
        .map(key => enumObject[key] as EnumObjectEnum<E>);
}