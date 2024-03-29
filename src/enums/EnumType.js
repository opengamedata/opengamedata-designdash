export default class EnumType {
   /**
    * @param {string} name 
    * @param {string} readable 
    */
   constructor(name, readable) { 
      this.name = name
      this.readable = readable
   }

   static Default() {
      throw new Error("Tried to call Default on an EnumType that did not implement it!")
      // return new EnumType("DEFAULT", "DEFAULT");
   }

   /**
    * Get the list of all objects for the Enum type.
    * @returns {EnumType[]}
    */
   static EnumList() {
      throw new Error("Tried to call EnumList on an EnumType that did not implement it!")
      // return [];
   }

   /**
    * Get the Enum object, given the "name" ID.
    * @param {string} name 
    */
   static FromName(name) {
      return this.EnumList().find((elem) => {return elem.asString === name})
   }

   /**
    * 
    * @param {object} enum_dict 
    * @param {string} enum_dict.name
    * @param {string} enum_dict.readable
    * @returns 
    */
   static FromDict(enum_dict) {
      return this.EnumList().find((elem) => elem.asString === enum_dict.name)
   }

   /**
    * Implemented as an equivalent to __repr__
    * @returns {string}
    */
   toString() {
      return `${this.constructor.name}[${this.name}]`
   }

   /**
    * Getter for the string ID of the enum
    * @returns {string} Enum object name
    */
   get asString() {
      return this.name;
   }
   /**
    * Getter for the human-readable version of enum name
    * @returns {string} Enum readable name
    */
   get asDisplayString() {
      return this.readable;
   }
}