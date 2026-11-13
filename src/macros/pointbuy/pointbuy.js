(() => {
  const MIN_SCORE = 8;
  const MAX_SCORE = 15;
  const DEFAULT_BUDGET = 27;
  const SCORE_COSTS = Object.freeze({
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  });
  const ABILITIES = Object.freeze([
    { key: 'str', label: 'Strength' },
    { key: 'dex', label: 'Dexterity' },
    { key: 'con', label: 'Constitution' },
    { key: 'int', label: 'Intelligence' },
    { key: 'wis', label: 'Wisdom' },
    { key: 'cha', label: 'Charisma' },
  ]);

  const getScoreCost = (score) => SCORE_COSTS[score];
  const getAbilityModifier = (score) => Math.floor((score - 10) / 2);

  const getTotalCost = (stats) => ABILITIES.reduce(
    (total, ability) => total + getScoreCost(stats[ability.key]),
    0,
  );

  setup.pointBuy = Object.freeze({
    getScoreCost,
    getAbilityModifier,
    getTotalCost,
    minScore: MIN_SCORE,
    maxScore: MAX_SCORE,
    defaultBudget: DEFAULT_BUDGET,
  });

  Macro.add('pointbuy', {
    handler() {
      if (this.args.length < 2) {
        return this.error('The <<pointbuy>> macro requires stats and pool variable names.');
      }

      const statsVariable = this.args[0];
      const poolVariable = this.args[1];
      const budget = this.args.length > 2 ? Number(this.args[2]) : DEFAULT_BUDGET;

      if (typeof statsVariable !== 'string' || statsVariable[0] !== '$') {
        return this.error('The stats variable name must be a story variable, such as "$player.stats".');
      }
      if (typeof poolVariable !== 'string' || poolVariable[0] !== '$') {
        return this.error('The pool variable name must be a story variable, such as "$statPool".');
      }
      if (!Number.isInteger(budget) || budget < 0) {
        return this.error('The point-buy budget must be a non-negative whole number.');
      }

      const stats = State.getVar(statsVariable);
      if (!stats || typeof stats !== 'object') {
        return this.error(`The stats variable ${statsVariable} does not contain an object.`);
      }

      const invalidAbility = ABILITIES.find(({ key }) => (
        !Number.isInteger(stats[key])
        || stats[key] < MIN_SCORE
        || stats[key] > MAX_SCORE
      ));
      if (invalidAbility) {
        return this.error(`${invalidAbility.label} must be a whole number from ${MIN_SCORE} to ${MAX_SCORE}.`);
      }
      if (getTotalCost(stats) > budget) {
        return this.error(`The selected ability scores exceed the ${budget}-point budget.`);
      }

      const $container = jQuery(document.createElement('div'))
        .addClass('macro-pointbuy')
        .appendTo(this.output);
      const $points = jQuery(document.createElement('p'))
        .addClass('pointbuy-points')
        .appendTo($container);
      const $table = jQuery(document.createElement('table'))
        .addClass('pointbuy-table')
        .appendTo($container);
      const $header = jQuery(document.createElement('tr')).appendTo($table);
      const controls = {};

      ['Ability', 'Score', 'Ability Modifier', 'Next Point Cost'].forEach((heading) => {
        jQuery(document.createElement('th')).text(heading).appendTo($header);
      });

      const render = () => {
        const currentStats = State.getVar(statsVariable);
        const remaining = budget - getTotalCost(currentStats);
        State.setVar(poolVariable, remaining);
        $points.text(`Points remaining: ${remaining}`);

        ABILITIES.forEach(({ key }) => {
          const score = currentStats[key];
          const modifier = getAbilityModifier(score);
          const nextScoreCost = score < MAX_SCORE
            ? getScoreCost(score + 1) - getScoreCost(score)
            : 0;
          controls[key].$input.val(score);
          controls[key].$modifier.text(modifier >= 0 ? `+${modifier}` : modifier);
          controls[key].$nextCost.text(score < MAX_SCORE ? nextScoreCost : 'Max');
          controls[key].$decrease.prop('disabled', score <= MIN_SCORE);
          controls[key].$increase.prop(
            'disabled',
            score >= MAX_SCORE || nextScoreCost > remaining,
          );
        });
      };

      const setScore = (key, proposedScore) => {
        const score = Number(proposedScore);
        const currentStats = State.getVar(statsVariable);

        if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
          render();
          return;
        }

        const previousScore = currentStats[key];
        currentStats[key] = score;
        if (getTotalCost(currentStats) > budget) {
          currentStats[key] = previousScore;
        }
        render();
      };

      ABILITIES.forEach(({ key, label }) => {
        const $row = jQuery(document.createElement('tr')).appendTo($table);
        const $control = jQuery(document.createElement('td')).addClass('pointbuy-control');
        const $decrease = jQuery(document.createElement('button'))
          .attr({
            type: 'button',
            'aria-label': `Decrease ${label}`,
          })
          .text('−')
          .ariaClick(this.createShadowWrapper(() => {
            setScore(key, State.getVar(statsVariable)[key] - 1);
          }));
        const $input = jQuery(document.createElement('input'))
          .attr({
            type: 'number',
            min: MIN_SCORE,
            max: MAX_SCORE,
            step: 1,
            'aria-label': `${label} score`,
          })
          .on('change', this.createShadowWrapper(() => {
            setScore(key, $input.val());
          }));
        const $increase = jQuery(document.createElement('button'))
          .attr({
            type: 'button',
            'aria-label': `Increase ${label}`,
          })
          .text('+')
          .ariaClick(this.createShadowWrapper(() => {
            setScore(key, State.getVar(statsVariable)[key] + 1);
          }));
        const $modifier = jQuery(document.createElement('td'));
        const $nextCost = jQuery(document.createElement('td'));

        jQuery(document.createElement('th')).attr('scope', 'row').text(label).appendTo($row);
        $control.append($decrease, $input, $increase).appendTo($row);
        $modifier.appendTo($row);
        $nextCost.appendTo($row);
        controls[key] = {
          $decrease,
          $increase,
          $input,
          $modifier,
          $nextCost,
        };
      });

      render();
      return undefined;
    },
  });
})();
