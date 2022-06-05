State.variables.weapons = {
    'Dagger': {
        name: 'Dagger',
        type: 'melee',
        damage: '1d4+2',
        throwable: true,
        requiresTwoHands: false,
        flavor: {
            criticalSuccess: 'You manage to catch the enemy off balance, and get an especially good hit.',
            criticalFailure: 'You swing your dagger and accidentally hit yourself!',
            success: [
                'You manage to hit the enemy.',
                'You hit the enemy.',
                'You hit the enemy with your dagger.',
            ],
            failure: [
                'You miss the enemy.',
                'You miss the enemy with your dagger.',
                'Swing and a miss.',
            ],
        },
        description: 'A small dagger. You could stab someone with this.',
    },
}