const router = require('express').Router();

const { User, Games, Favorites } = require('../../models');

var validator = require("email-validator");



router.get('/', async (req, res) => {

  const userData = await User.findAll();

  console.log(userData)

  res.status(200).json(userData)

 });

 router.get('/:id', async (req, res) => {
  try {
    const userData = await User.findByPk(req.params.id, {
      
      include: [{ model: Games, through: Favorites, as: 'user_favorites' }]

    });

    if (!userData) {

      res.status(404).json({ message: 'No user found with this id!' });

      return;
    }
    res.status(200).json(userData);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);

  };
});


router.post('/', async (req, res) => {

  try {

    const userData = await User.create({

      username: req.body.username,
      email: req.body.email,
      password: req.body.password,

    });

    req.session.save(() => {

      req.session.loggedIn = true;

      req.session.user_id = userData.id;

      req.session.username = userData.username;
      

      res.status(200).json(userData);

    });

    // validator.validate(req.body.email);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  };
});



router.post('/login', async (req, res) => {

  try {

    const userData = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!userData) {

      res
        .status(400)

        .json({ message: 'Incorrect email or password, please try again' });

      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {

      res
        .status(400)

        .json({ message: 'Incorrect email or password, please try again' });

      return;
    }

    req.session.save(() => {

      req.session.user_id = userData.id;

      req.session.username = userData.username;

      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });

    });

  } catch (err) {

    res.status(400).json(err);

  }
});



router.post('/logout', (req, res) => {

  if (req.session.logged_in) {

    req.session.destroy(() => {

      res.status(204).end();

    });

  } else {

    res.status(404).end();
    
  }
});



router.delete('/:id',  async (req, res) => {

  try {
    const userData = await User.destroy({

      where: {

        id: req.params.id,

      },
    });

    if (!userData) {

      res.status(404).json({ message: 'No user found with this id!' });

      return;
    }

    res.status(200).json(userData);

  } catch (err) {

    res.status(500).json(err);
    
  }
});

module.exports = router;
