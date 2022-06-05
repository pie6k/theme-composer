import { styledLeaf } from "../styleLeaf";
import { createTheme } from "../theme";

describe("theme", () => {
  it("proxies", () => {
    const leafA = styledLeaf()
      .prop("flag", (flag: string) => flag)
      .done(() => "a");
    const leafB = styledLeaf()
      .prop("flag", (flag: string) => flag)
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
      getValue(() => proxiedTheme.foo.bar.flag("2"), { theme: rawThemeB })
    ).toEqual(["2", "b"]);
    // expect(
    //   getValue(() => proxiedTheme.foo.bar.flag("2"), { theme: rawThemeB })
    // ).toEqual(["b"]);
  });
});
