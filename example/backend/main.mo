import Text "mo:base/Text";

actor HelloWorld {
  public query func say_hello() : async Text {
    return "Hello World!";
  };
};
