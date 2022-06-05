import { styledLeaf } from "../styleLeaf";
import { createTheme } from "../theme";

describe("theme", () => {
  it("proxies", () => {
    const leafA = styledLeaf()
      .flag("flag")
      .done(() => ["a"]);
    const leafB = styledLeaf()
      .flag("flag")
      .done(() => ["b"]);

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

    const proxiedTheme = createTheme(rawTheme);

    expect(proxiedTheme.foo.bar.flag.flag({ theme: rawTheme })).toEqual([
      ["a"],
    ]);
    expect(proxiedTheme.foo.bar.flag.flag({ theme: rawThemeB })).toEqual([
      ["b"],
    ]);
    // expect()
  });
});
