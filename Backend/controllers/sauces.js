

const Sauces = require('../models/sauces');
const fs = require('fs');

// Permet de créer une nouvelle sauce

exports.createSauces = (req, res, next) => {
  // On stocke les données envoyées par le front-end sous forme de form-data dans une variable en les transformant en objet js
  const saucesObject = JSON.parse(req.body.sauces);
  // On supprime l'id généré automatiquement et envoyé par le front-end. L'id de la sauce est créé par la base MongoDB lors de la création dans la base
  delete saucesObject._id;
  // Création d'une instance du modèle Sauce
  const sauces = new Sauces({
    ...saucesObject,
    // On modifie l'URL de l'image, on veut l'URL complète, quelque chose dynamique avec les segments de l'URL
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  // Sauvegarde de la sauce dans la base de données
  sauces.save()
    // On envoi une réponse au frontend avec un statut 201 sinon on a une expiration de la requête
    .then(() => res.status(201).json({
      message: 'Sauce enregistrée !'
    }))
    // On ajoute un code erreur en cas de problème
    .catch(error => res.status(400).json({
      error
    }));
  //.catch(error => {
  //res.writeHead( 400, '{"message":"Format des champs du formulaire sauce ne validant pas le middleware sauceValidation"}', {'content-type' : 'application/json'});
  //res.end('Format des champs du formulaire invalide');
  //})
};

// Permet de modifier une sauce

exports.modifySauces = (req, res, next) => {
  let saucesObject = {};
  req.file ? (
    // Si la modification contient une image => Utilisation de l'opérateur ternaire comme structure conditionnelle.
    Sauces.findOne({
      _id: req.params.id
    }).then((sauces) => {
      // On supprime l'ancienne image du serveur
      const filename = sauces.imageUrl.split('/images/')[1]
      fs.unlinkSync(`images/${filename}`)
    }),
    saucesObject = {
      // On modifie les données et on ajoute la nouvelle image
      ...JSON.parse(req.body.sauces),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
    }
  ) : ( // Opérateur ternaire équivalent à if() {} else {} => condition ? Instruction si vrai : Instruction si faux
    // Si la modification ne contient pas de nouvelle image
    saucesObject = {
      ...req.body
    }
  )
  Sauces.updateOne(
      // On applique les paramètre de sauceObject
      {
        _id: req.params.id
      }, {
        ...saucesObject,
        _id: req.params.id
      }
    )
    .then(() => res.status(200).json({
      message: 'Sauce modifiée !'
    }))
    .catch((error) => res.status(400).json({
      error
    }))
}

// Permet de supprimer la sauce

exports.deleteSauces = (req, res, next) => {
  // Avant de suppr l'objet, on va le chercher pour obtenir l'url de l'image et supprimer le fichier image de la base
  Sauces.findOne({
      _id: req.params.id
    })
    .then(sauces => {
      // Pour extraire ce fichier, on récupère l'url de la sauce, et on le split autour de la chaine de caractères, donc le nom du fichier
      const filename = sauces.imageUrl.split('/images/')[1];
      // Avec ce nom de fichier, on appelle unlink pour suppr le fichier
      fs.unlink(`images/${filename}`, () => {
        // On supprime le document correspondant de la base de données
        Sauces.deleteOne({
            _id: req.params.id
          })
          .then(() => res.status(200).json({
            message: 'Sauce supprimée !'
          }))
          .catch(error => res.status(400).json({
            error
          }));
      });
    })
    .catch(error => res.status(500).json({
      error
    }));
};

// Permet de récupérer une seule sauce, identifiée par son id depuis la base MongoDB

exports.getOneSauces = (req, res, next) => {
  // On utilise la méthode findOne et on lui passe l'objet de comparaison, on veut que l'id de la sauce soit le même que le paramètre de requête
  Sauces.findOne({
      _id: req.params.id
    })
    // Si ok on retourne une réponse et l'objet
    .then(sauces => res.status(200).json(sauces))
    // Si erreur on génère une erreur 404 pour dire qu'on ne trouve pas l'objet
    .catch(error => res.status(404).json({
      error
    }));
};

// Permet de récuperer toutes les sauces de la base MongoDB

exports.getAllSauces = (req, res, next) => {
  // On utilise la méthode find pour obtenir la liste complète des sauces trouvées dans la base, l'array de toutes les sauves de la base de données
  Sauces.find()
    // Si OK on retourne un tableau de toutes les données
    .then(sauces => res.status(200).json(sauces))
    // Si erreur on retourne un message d'erreur
    .catch(error => res.status(400).json({
      error
    }));
};

// Permet de "liker"ou "dislaker" une sauce

exports.likeDislike = (req, res, next) => {
  // Pour la route READ = Ajout/suppression d'un like / dislike à une sauce
  // Like présent dans le body
  let like = req.body.like
  // On prend le userID
  let userId = req.body.userId
  // On prend l'id de la sauce
  let saucesId = req.params.id

  if (like === 1) { // Si il s'agit d'un like
    Sauces.updateOne({
        _id: saucesId
      }, {
        // On push l'utilisateur et on incrémente le compteur de 1
        $push: {
          usersLiked: userId
        },
        $inc: {
          likes: +1
        }, // On incrémente de 1
      })
      .then(() => res.status(200).json({
        message: 'jaime ajouté !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === -1) {
    Sauces.updateOne( // S'il s'agit d'un dislike
        {
          _id: saucesId
        }, {
          $push: {
            usersDisliked: userId
          },
          $inc: {
            dislikes: +1
          }, // On incrémente de 1
        }
      )
      .then(() => {
        res.status(200).json({
          message: 'Dislike ajouté !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === 0) { // Si il s'agit d'annuler un like ou un dislike
    Sauces.findOne({
        _id: saucesId
      })
      .then((sauces) => {
        if (sauces.usersLiked.includes(userId)) { // Si il s'agit d'annuler un like
          Sauces.updateOne({
              _id: saucesId
            }, {
              $pull: {
                usersLiked: userId
              },
              $inc: {
                likes: -1
              }, // On incrémente de -1
            })
            .then(() => res.status(200).json({
              message: 'Like retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
        if (sauces.usersDisliked.includes(userId)) { // Si il s'agit d'annuler un dislike
          Sauces.updateOne({
              _id: saucesId
            }, {
              $pull: {
                usersDisliked: userId
              },
              $inc: {
                dislikes: -1
              }, // On incrémente de -1
            })
            .then(() => res.status(200).json({
              message: 'Dislike retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
      })
      .catch((error) => res.status(404).json({
        error
      }))
  }
}