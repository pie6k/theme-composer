import { createLeaf } from "../leaf/leaf";

describe("base", () => {
  it("works", () => {
    const leaf = createLeaf<string>(() => "init")
      .flag("foo", () => "foo")
      .done(() => "final");

    expect(leaf.foo()).toEqual(["init", "foo", "final"]);
  });

  it("captures flag", () => {
    const leaf = createLeaf<any>()
      .flag("foo")
      .done((flags) => flags);

    expect(leaf.foo()).toEqual([{ foo: true }]);
    expect(leaf.foo.foo()).toEqual([{ foo: true }]);
  });

  it("captures prop", () => {
    const leaf = createLeaf<any>()
      .prop("count")
      .done((flags) => flags);

    expect(leaf.count(2)()).toEqual([{ count: 2 }]);
  });

  it("captures prop getter", () => {
    const leaf = createLeaf<any>()
      .prop("count", (count) => ({ fromFlag: count }))
      .done((flags) => flags);

    expect(leaf.count(2)()).toEqual([{ fromFlag: 2 }, { count: 2 }]);
  });
});
