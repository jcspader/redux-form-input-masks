import { createNumberMask } from '../index';

describe('Number mask', () => {
  it('should add the prefix to formatted input', () => {
    const prefix = 'prefix 1@,.';
    const number = 90;

    const mask = createNumberMask({ prefix });
    expect(mask.format(number)).toBe(`${prefix}${number.toLocaleString()}`);
  });

  it('should add the suffix to formatted input', () => {
    const suffix = '1@,. suffix';
    const number = 90;

    const mask = createNumberMask({ suffix });
    expect(mask.format(number)).toBe(`${number.toLocaleString()}${suffix}`);
  });

  it('should have the correct amount of decimal places', () => {
    const prefix = 'p';
    const suffix = 's';
    const decimalPlaces = 5;
    const number = 1234.56789;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });
    expect(mask.format(number)).toBe(
      `${prefix}${number.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}${suffix}`,
    );
  });

  it('should consider the multiplier when storing the value', () => {
    // In this case the displayed value will be displayedNumber * multiplier
    const decimalPlaces = 2;
    const displayedNumber = '33.33';
    const multiplier = 1 / 100;

    const mask = createNumberMask({ decimalPlaces, multiplier });
    expect(mask.normalize(displayedNumber)).toBe(displayedNumber * multiplier);
  });

  it('should consider the multiplier when formatting the value', () => {
    // In this case the displayed value will be storedNumber / multiplier
    const decimalPlaces = 2;
    const storedNumber = 0.3333;
    const multiplier = 1 / 100;

    const mask = createNumberMask({ decimalPlaces, multiplier });
    expect(mask.format(storedNumber)).toBe(
      `${(storedNumber / multiplier).toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}`,
    );
  });

  it('should be able to format the number with a plus sign', () => {
    const prefix = 'p';
    const showPlusSign = true;

    const mask = createNumberMask({ prefix, showPlusSign });
    expect(mask.format(1000)).toBe('+p1,000');
  });

  it('should be able to format the number with a space after the sign', () => {
    const prefix = 'p';
    const allowNegative = true;
    const showPlusSign = true;
    const spaceAfterSign = true;

    const mask = createNumberMask({
      prefix,
      allowNegative,
      showPlusSign,
      spaceAfterSign,
    });

    expect(mask.format(1000)).toBe('+ p1,000');
    expect(mask.format(-1000)).toBe('- p1,000');
  });

  it('should be formatting the number according to the locale', () => {
    // The default node build includes only en-US locale.
    const locale = 'en-US';
    const decimalPlaces = 1;
    const number = 1000;

    const mask = createNumberMask({ decimalPlaces, locale });
    expect(mask.format(number)).toBe('1,000.0');
  });

  it('should be formatting correctly when the value is stored as a string', () => {
    const string = '1234.567';
    const decimalPlaces = 3;
    const locale = 'en-US';
    const stringValue = true;

    const mask = createNumberMask({ decimalPlaces, locale, stringValue });
    expect(mask.format(string)).toBe('1,234.567');
  });

  it('should be formatting correctly when the value is negative', () => {
    const prefix = ' -- ';
    const suffix = '-';
    const stringValue = true;
    const allowNegative = true;

    const number = -1234;
    const absoluteNumber = 1234;
    const string = '-1234';

    const negativeNumberMask = createNumberMask({
      prefix,
      suffix,
      allowNegative,
    });
    const positiveNumberMask = createNumberMask({ prefix, suffix });
    const negativeStringMask = createNumberMask({
      prefix,
      suffix,
      stringValue,
      allowNegative,
    });
    const positiveStringMask = createNumberMask({
      prefix,
      suffix,
      stringValue,
    });

    expect(negativeNumberMask.format(number)).toBe(
      `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
    );
    expect(positiveNumberMask.format(number)).toBe(
      `${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
    );
    expect(negativeStringMask.format(string)).toBe(
      `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
    );
    expect(positiveStringMask.format(string)).toBe(
      `${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
    );
  });

  it('should be formatting as zero when the value on the store is undefined and allowEmpty is false', () => {
    const prefix = 'p';
    const suffix = 's';
    const mask = createNumberMask({ prefix, suffix, allowEmpty: false });

    expect(mask.format()).toBe(
      `${prefix}${Number(0).toLocaleString()}${suffix}`,
    );
  });

  it('should be formatting as empty string when the value on the store is undefined and allowEmpty is true', () => {
    const mask = createNumberMask({
      prefix: 'p',
      suffix: 's',
      allowEmpty: true,
    });

    expect(mask.format()).toBe('');
  });

  it('should be formatting as empty string when the value on the store is empty string and allowEmpty is true', () => {
    const mask = createNumberMask({
      prefix: 'p',
      suffix: 's',
      allowEmpty: true,
    });

    expect(mask.format('')).toBe('');
  });

  it('should update the stored value correctly', () => {
    const prefix = 'prefix 1@,.';
    const suffix = '1@,. suffix';
    const decimalPlaces = '4';
    const stringValue = true;

    const prefixMask = createNumberMask({ prefix });
    const suffixMask = createNumberMask({ suffix });
    const decimalPlacesMask = createNumberMask({ decimalPlaces });
    const stringValueMask = createNumberMask({ stringValue });
    const allMask = createNumberMask({
      prefix,
      suffix,
      decimalPlaces,
      stringValue,
    });

    expect(prefixMask.normalize(`${prefix}1,2345`)).toBe(12345);
    expect(prefixMask.normalize(`${prefix}1,2340`)).toBe(12340);

    expect(suffixMask.normalize(`1,2345${suffix}`)).toBe(12345);
    expect(suffixMask.normalize(`1,2340${suffix}`)).toBe(12340);

    expect(decimalPlacesMask.normalize(`1,234.56789`)).toBe(12345.6789);
    expect(decimalPlacesMask.normalize(`1,234.56780`)).toBe(12345.678);

    expect(stringValueMask.normalize('1,2345')).toBe('12345');
    expect(stringValueMask.normalize('1,2340')).toBe('12340');

    expect(allMask.normalize(`+${prefix}1,234.56789${suffix}`)).toBe(
      '12345.6789',
    );
    expect(allMask.normalize(`+ ${prefix}1,234.56789${suffix}`)).toBe(
      '12345.6789',
    );
    expect(allMask.normalize(`${prefix}1,234.56789${suffix}`)).toBe(
      '12345.6789',
    );
    expect(allMask.normalize(`${prefix}1,234.56780${suffix}`)).toBe(
      '12345.678',
    );
  });

  it('should ignore any non-alphanumeric characters inputted', () => {
    const prefix = 'p';
    const suffix = 's';
    const decimalPlaces = 1;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });

    expect(mask.normalize(`${prefix}1,234a${suffix}`)).toBe(123.4);
    expect(mask.normalize(`${prefix}a1,!2?3.4/${suffix}`)).toBe(123.4);
  });

  it('should return null for empty input when allowEmpty is true', () => {
    const mask = createNumberMask({ allowEmpty: true, decimalPlaces: 2 });

    expect(mask.normalize('')).toBe(null);
    expect(mask.normalize('0.0', 0)).toBe(null);
    expect(mask.normalize('0.00', 0)).toBe(0);
  });

  it('should return the inputted value when allowEmpty is true', () => {
    const mask = createNumberMask({ allowEmpty: true, decimalPlaces: 2 });

    expect(mask.normalize('0', null)).toBe(0);
    expect(mask.normalize('1', null)).toBe(0.01);
  });

  it('should return the inputted value as string when both allowEmpty and stringValue is true', () => {
    const mask = createNumberMask({
      allowEmpty: true,
      stringValue: true,
      decimalPlaces: 2,
    });

    expect(mask.normalize('0', null)).toBe('0');
    expect(mask.normalize('1', null)).toBe('0.01');
  });

  it('should call onChange if it is passed as an option', () => {
    const onChange = jest.fn();
    const mask = createNumberMask({ onChange });

    const updatedValue = mask.normalize('123,456,789');

    expect(onChange).toBeCalledWith(updatedValue);
  });

  it('should fix the caret position before the suffix', () => {
    // Needed because we use setTimeout on our manageCaretPosition function
    jest.useFakeTimers();

    const prefix = 'prefix 1@,.';
    const suffix = '1@,. suffix';
    const value = '1,234.56789';
    const decimalPlaces = '5';

    // Mocked events
    const event = {
      persist: jest.fn(),
      target: {
        value: `${prefix}${value}${suffix}`,
        setSelectionRange: jest.fn(),
      },
    };

    // prefix 1@,.1,234.56789|
    // Caret should be here! ^ in the 22th position
    const correctCaretPosition = 22;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });

    // Simulate events
    mask.onChange(event);
    mask.onFocus(event);

    jest.runAllTimers();

    expect(event.target.setSelectionRange).toHaveBeenLastCalledWith(
      correctCaretPosition,
      correctCaretPosition,
    );

    expect(event.target.setSelectionRange).toHaveBeenCalledTimes(2);
    expect(event.persist).toHaveBeenCalledTimes(2);

    // These are used just to cover the else statements
    mask.onChange({});
    mask.onChange({
      target: {
        value: `${prefix}${value}${suffix}`,
        setSelectionRange: () => {},
      },
    });
  });

  it('should force the input prop "autocomplete" to "off"', () => {
    const mask = createNumberMask();

    expect(mask.autoComplete).toBe('off');
  });

  it('should handle negative values configurations properly', () => {
    const prefix = ' -- ';
    const suffix = '-';
    const stringValue = true;
    const allowNegative = true;

    const number = -1234;
    const absoluteNumber = 1234;
    const string = '-1234';
    const absoluteString = '1234';

    const simpleNegativeNumberMask = createNumberMask({
      allowNegative,
    });
    const negativeNumberMask = createNumberMask({
      prefix,
      suffix,
      allowNegative,
    });
    const positiveNumberMask = createNumberMask({ prefix, suffix });
    const negativeStringMask = createNumberMask({
      prefix,
      suffix,
      stringValue,
      allowNegative,
    });
    const positiveStringMask = createNumberMask({
      prefix,
      suffix,
      stringValue,
    });

    expect(
      simpleNegativeNumberMask.normalize(`-${absoluteNumber.toLocaleString()}`),
    ).toBe(number);
    expect(
      negativeNumberMask.normalize(
        `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
      ),
    ).toBe(number);
    expect(
      negativeNumberMask.normalize(
        `- ${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
      ),
    ).toBe(number);
    expect(
      negativeNumberMask.normalize(
        `${prefix}${absoluteNumber.toLocaleString()}-${suffix}`,
      ),
    ).toBe(number);

    expect(
      positiveNumberMask.normalize(
        `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
      ),
    ).toBe(absoluteNumber);

    expect(
      negativeStringMask.normalize(
        `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
      ),
    ).toBe(string);

    expect(
      positiveStringMask.normalize(
        `-${prefix}${absoluteNumber.toLocaleString()}${suffix}`,
      ),
    ).toBe(absoluteString);
  });

  it('should throw an error if decimalPlaces is greater than 10', () => {
    expect(() => createNumberMask({ decimalPlaces: 11 })).toThrowError(
      "The maximum value for createNumberMask's option `decimalPlaces` is 10.",
    );
  });

  it('should throw an error if multiplier is not type number', () => {
    expect(() => createNumberMask({ multiplier: '1' })).toThrowError(
      "The createNumberMask's option `multilpier` should be of type number.",
    );
  });

  it('should throw an error if multiplier is equal to zero', () => {
    expect(() => createNumberMask({ multiplier: 0 })).toThrowError(
      "The createNumberMask's option `multilpier` cannot be zero.",
    );
  });
});
