import { createLeaf } from "../leaf/leafComposer";

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
      .prop("count", (count: number) => ({ fromFlag: count }))
      .done((flags) => flags);

    expect(leaf.count(2)()).toEqual([{ fromFlag: 2 }, { count: 2 }]);
  });

  it("properly handles required props", () => {
    const leaf = createLeaf<any>()
      .requiredProp("count")
      .prop("multiply")
      .done();

    expect(() => leaf.multiply(2)).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add optional prop \\"multiply\\" before all required props are filled - missing required props - \\"count\\""`
    );

    expect(() => leaf.$data).toThrowErrorMatchingInlineSnapshot(
      `"Cannot get data using $data from leaf before all required props are filled - missing required props - \\"count\\""`
    );

    expect(() => leaf.count(2).multiply(3)).not.toThrow();
  });

  it("properly handles multiple required props", () => {
    const leaf = createLeaf<any>()
      .requiredProp("count")
      .requiredProp("size")
      .prop("multiply")
      .done();

    expect(() => leaf.multiply(2)).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add optional prop \\"multiply\\" before all required props are filled - missing required props - \\"count\\", \\"size\\""`
    );

    expect(() => leaf.$data).toThrowErrorMatchingInlineSnapshot(
      `"Cannot get data using $data from leaf before all required props are filled - missing required props - \\"count\\", \\"size\\""`
    );

    expect(() => leaf.count(2).multiply(3)).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add optional prop \\"multiply\\" before all required props are filled - missing required props - \\"size\\""`
    );

    expect(() => leaf.count(2).$data).toThrowErrorMatchingInlineSnapshot(
      `"Cannot get data using $data from leaf before all required props are filled - missing required props - \\"size\\""`
    );

    expect(() => leaf.count(2).size(3).multiply(3)).not.toThrow();

    expect(leaf.count(2).size(3).$data).toEqual({ count: 2, size: 3 });

    expect(leaf.count(2).size(3).multiply(4).$data).toEqual({
      count: 2,
      size: 3,
      multiply: 4,
    });
  });

  it("returns true for $isLeaf", () => {
    const leaf = createLeaf<any>().done();

    expect(leaf.$isLeaf).toBe(true);
  });

  it("will prevent overriting built in props", () => {
    expect(() => {
      createLeaf().prop("$data");
    }).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add prop \\"$data\\" to leaf composer. This field is reserved as built in prop"`
    );

    expect(() => {
      createLeaf().prop("$isLeaf");
    }).toThrowErrorMatchingInlineSnapshot(
      `"Cannot add prop \\"$isLeaf\\" to leaf composer. This field is reserved as built in prop"`
    );
  });

  it("will prevent defining the same prop twice", () => {
    expect(() => {
      createLeaf().prop("foo").prop("foo");
    }).toThrowErrorMatchingInlineSnapshot(
      `"Trying to add prop \\"foo\\" to leaf composer, but this field is already defined."`
    );

    expect(() => {
      createLeaf().prop("foo").flag("foo");
    }).toThrowErrorMatchingInlineSnapshot(
      `"Trying to add prop \\"foo\\" to leaf composer, but this field is already defined."`
    );
  });

  it("works with required default values", () => {
    const foo = createLeaf().requiredProp("foo", null, 3).prop("bar").done();

    expect(foo.bar(3).$data).toEqual({ foo: 3, bar: 3 });
    expect(foo.bar(3).foo(4).$data).toEqual({ foo: 4, bar: 3 });
    expect(foo.$data).toEqual({ foo: 3 });
  });

  it("allows value to be overwritten", () => {
    const foo = createLeaf()
      .prop("count", (count) => count)
      .done();

    expect(foo.count(3)()).toEqual([3]);
    expect(foo.count(3).count(4)()).toEqual([3, 4]);
    expect(foo.count(3).count(4).$data).toEqual({ count: 4 });
  });

  it("allows modifying data from builder", () => {
    const inc = createLeaf()
      .requiredProp("num", null, 2)
      .flag("double", (data) => {
        data.num = data.num * 2;
      })
      .done();

    expect(inc.double.$data.num).toBe(4);
    expect(inc.double.double.$data.num).toBe(8);
  });

  it("supports adding multiple defaults", () => {
    const foo = createLeaf().addDefaults({ foo: 2, bar: 3 }).done();

    expect(foo.$data).toEqual({ foo: 2, bar: 3 });
    expect(foo.foo(4).$data).toEqual({ foo: 4, bar: 3 });
  });
});
