import { styledLeaf } from "../styleLeaf";
import { createTheme } from "../theme";

describe("theme", () => {
  it("proxies", () => {
    const leafA = styledLeaf()
      .prop("flag", (flag: string) => flag)
      .flag("isBig", () => "isBig")
      .done(() => "a");
    const leafB = styledLeaf()
      .prop("flag", (flag: string) => flag)
      .flag("isBig", () => "isBig")
      .done(() => "b");

    const rawTheme = {
      foo: {
        bar: leafA,
      },
    };

    const rawThemeB = {
      foo: {
        bar: leafB,
      },
    };

    const [proxiedTheme, getValue] = createTheme(rawTheme);

    expect(
      getValue(() => proxiedTheme.foo.bar.flag("1"), { theme: rawTheme })
    ).toEqual(["1", "a"]);

    expect(
      getValue(() => proxiedTheme.foo.bar.flag("2").flag("3").isBig, {
        theme: rawThemeB,
      })
    ).toEqual(["2", "3", "isBig", "b"]);

    expect(
      getValue(
        () => proxiedTheme.foo.bar.flag("2").flag("3").isBig.$data.isBig,
        {
          theme: rawThemeB,
        }
      )
    ).toEqual(true);

    expect(
      getValue(() => proxiedTheme.foo.bar.flag("2").flag("3").isBig.$data, {
        theme: rawThemeB,
      })
    ).toEqual({ flag: "3", isBig: true });
  });
});
